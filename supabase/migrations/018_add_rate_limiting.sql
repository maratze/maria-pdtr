-- Таблица для логирования попыток бронирования
CREATE TABLE public.booking_attempts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address inet NOT NULL,
    client_fingerprint text,
    client_name text,
    client_phone text,
    client_email text,
    attempt_time timestamptz DEFAULT now(),
    success boolean DEFAULT false,
    blocked boolean DEFAULT false
);

-- Индексы для быстрого поиска
CREATE INDEX idx_booking_attempts_ip ON public.booking_attempts(ip_address);
CREATE INDEX idx_booking_attempts_time ON public.booking_attempts(attempt_time);
CREATE INDEX idx_booking_attempts_fingerprint ON public.booking_attempts(client_fingerprint);
CREATE INDEX idx_booking_attempts_phone ON public.booking_attempts(client_phone);

-- Таблица для блокировки IP и других идентификаторов
CREATE TABLE public.blocked_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address inet,
    client_fingerprint text,
    phone_number text,
    email text,
    reason text,
    blocked_at timestamptz DEFAULT now(),
    blocked_until timestamptz,
    is_permanent boolean DEFAULT false,
    created_by uuid, -- admin user id
    notes text
);

CREATE INDEX idx_blocked_clients_ip ON public.blocked_clients(ip_address);
CREATE INDEX idx_blocked_clients_fingerprint ON public.blocked_clients(client_fingerprint);
CREATE INDEX idx_blocked_clients_phone ON public.blocked_clients(phone_number);
CREATE INDEX idx_blocked_clients_email ON public.blocked_clients(email);

-- Enable RLS
ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_clients ENABLE ROW LEVEL SECURITY;

-- Только service_role может работать с этими таблицами
CREATE POLICY "service_role_all_booking_attempts"
ON public.booking_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_all_blocked_clients"
ON public.blocked_clients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Функция для проверки rate limit и блокировки
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

-- Функция для логирования попытки бронирования
CREATE OR REPLACE FUNCTION public.log_booking_attempt(
    p_ip_address inet,
    p_client_fingerprint text,
    p_client_name text,
    p_client_phone text,
    p_client_email text,
    p_success boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.booking_attempts (
        ip_address,
        client_fingerprint,
        client_name,
        client_phone,
        client_email,
        success
    ) VALUES (
        p_ip_address,
        p_client_fingerprint,
        p_client_name,
        p_client_phone,
        p_client_email,
        p_success
    );
END;
$$;

-- Функция для автоматической блокировки при подозрительной активности
CREATE OR REPLACE FUNCTION public.auto_block_suspicious_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record record;
BEGIN
    -- Блокируем IP с более чем 10 попытками за последний час
    FOR v_record IN
        SELECT ip_address, COUNT(*) as attempt_count
        FROM public.booking_attempts
        WHERE attempt_time > now() - interval '1 hour'
        GROUP BY ip_address
        HAVING COUNT(*) >= 10
    LOOP
        -- Проверяем, не заблокирован ли уже
        IF NOT EXISTS(
            SELECT 1 FROM public.blocked_clients
            WHERE ip_address = v_record.ip_address
            AND (is_permanent = true OR blocked_until > now())
        ) THEN
            INSERT INTO public.blocked_clients (
                ip_address,
                reason,
                blocked_until,
                notes
            ) VALUES (
                v_record.ip_address,
                'Автоматическая блокировка: подозрительная активность',
                now() + interval '24 hours',
                'Обнаружено ' || v_record.attempt_count || ' попыток за час'
            );
        END IF;
    END LOOP;
END;
$$;

-- Создаем задачу для автоматической очистки старых логов (опционально)
-- Будет удалять записи старше 30 дней
CREATE OR REPLACE FUNCTION public.cleanup_old_booking_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.booking_attempts
    WHERE attempt_time < now() - interval '30 days';
    
    DELETE FROM public.blocked_clients
    WHERE blocked_until < now()
    AND is_permanent = false;
END;
$$;

-- Предоставляем доступ к функциям
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_booking_attempt TO anon, authenticated;
