-- Ограничение на максимальное количество активных бронирований
-- Защита от массового захвата всех слотов

-- Обновляем функцию check_rate_limit с проверкой активных бронирований
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_ip_address inet,
    p_client_fingerprint text DEFAULT NULL,
    p_client_phone text DEFAULT NULL,
    p_client_email text DEFAULT NULL
)
RETURNS TABLE (
    allowed boolean,
    reason text,
    remaining_attempts integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempts_1hour integer;
    v_attempts_24hours integer;
    v_recent_bookings integer;
    v_active_bookings integer;
    v_is_blocked boolean;
    v_block_reason text;
BEGIN
    -- Проверка постоянной блокировки по IP
    SELECT EXISTS(
        SELECT 1 FROM public.blocked_clients
        WHERE ip_address = p_ip_address
        AND is_permanent = true
    ) INTO v_is_blocked;
    
    IF v_is_blocked THEN
        RETURN QUERY SELECT false, 'IP адрес заблокирован администратором'::text, 0;
        RETURN;
    END IF;
    
    -- Проверка временной блокировки по IP
    SELECT EXISTS(
        SELECT 1 FROM public.blocked_clients
        WHERE ip_address = p_ip_address
        AND blocked_until > now()
    ) INTO v_is_blocked;
    
    IF v_is_blocked THEN
        RETURN QUERY SELECT false, 'IP адрес временно заблокирован. Попробуйте позже'::text, 0;
        RETURN;
    END IF;
    
    -- Проверка блокировки по fingerprint
    IF p_client_fingerprint IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.blocked_clients
            WHERE client_fingerprint = p_client_fingerprint
            AND (is_permanent = true OR blocked_until > now())
        ) INTO v_is_blocked;
        
        IF v_is_blocked THEN
            RETURN QUERY SELECT false, 'Ваше устройство заблокировано'::text, 0;
            RETURN;
        END IF;
    END IF;
    
    -- Проверка блокировки по телефону
    IF p_client_phone IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM public.blocked_clients
            WHERE phone_number = p_client_phone
            AND (is_permanent = true OR blocked_until > now())
        ) INTO v_is_blocked;
        
        IF v_is_blocked THEN
            RETURN QUERY SELECT false, 'Этот номер телефона заблокирован'::text, 0;
            RETURN;
        END IF;
        
        -- НОВАЯ ПРОВЕРКА: Количество активных (будущих) бронирований по телефону
        SELECT COUNT(*) INTO v_active_bookings
        FROM public.bookings b
        JOIN public.time_slots ts ON b.slot_id = ts.id
        WHERE b.client_phone = p_client_phone
        AND b.status IN ('pending', 'confirmed')
        AND (
            ts.slot_date > CURRENT_DATE
            OR (ts.slot_date = CURRENT_DATE AND ts.start_time > CURRENT_TIME)
        );
        
        -- Лимит: максимум 5 активных бронирований на будущее
        IF v_active_bookings >= 5 THEN
            RETURN QUERY SELECT false, 'У вас уже есть максимальное количество активных бронирований (5). Пожалуйста, дождитесь их завершения или отмените некоторые'::text, 0;
            RETURN;
        END IF;
    END IF;
    
    -- Подсчет попыток за последний час
    SELECT COUNT(*) INTO v_attempts_1hour
    FROM public.booking_attempts
    WHERE ip_address = p_ip_address
    AND attempt_time > now() - interval '1 hour';
    
    -- Лимит: максимум 5 попыток в час
    IF v_attempts_1hour >= 5 THEN
        RETURN QUERY SELECT false, 'Превышен лимит бронирований. Попробуйте через час'::text, 0;
        RETURN;
    END IF;
    
    -- Подсчет успешных бронирований за последние 24 часа
    SELECT COUNT(*) INTO v_recent_bookings
    FROM public.booking_attempts
    WHERE ip_address = p_ip_address
    AND success = true
    AND attempt_time > now() - interval '24 hours';
    
    -- Лимит: максимум 3 успешных бронирования в день
    IF v_recent_bookings >= 3 THEN
        RETURN QUERY SELECT false, 'Вы достигли дневного лимита бронирований'::text, 0;
        RETURN;
    END IF;
    
    -- Все проверки пройдены
    RETURN QUERY SELECT true, 'OK'::text, (5 - v_attempts_1hour)::integer;
END;
$$;

-- Создаем функцию для получения информации об активных бронированиях клиента
CREATE OR REPLACE FUNCTION public.get_client_active_bookings_count(
    p_client_phone text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count integer;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.bookings b
    JOIN public.time_slots ts ON b.slot_id = ts.id
    WHERE b.client_phone = p_client_phone
    AND b.status IN ('pending', 'confirmed')
    AND (
        ts.slot_date > CURRENT_DATE
        OR (ts.slot_date = CURRENT_DATE AND ts.start_time > CURRENT_TIME)
    );
    
    RETURN v_count;
END;
$$;

-- Даем доступ к новой функции
GRANT EXECUTE ON FUNCTION public.get_client_active_bookings_count TO anon, authenticated;

-- Комментарии
COMMENT ON FUNCTION public.check_rate_limit IS 'Проверяет все ограничения для бронирования: блокировки, rate limits, активные бронирования';
COMMENT ON FUNCTION public.get_client_active_bookings_count IS 'Возвращает количество активных (будущих) бронирований клиента по номеру телефона';
