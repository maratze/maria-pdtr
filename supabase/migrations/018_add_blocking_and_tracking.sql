-- Система блокировки пользователей и отслеживания попыток бронирования
-- БЕЗ лимитов на количество бронирований - администратор блокирует вредителей вручную

-- ============================================
-- ТАБЛИЦЫ
-- ============================================

-- Таблица для логирования ВСЕХ попыток бронирования
-- Используется для отслеживания активности и выявления подозрительных пользователей
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

-- Индексы для быстрого поиска и анализа
CREATE INDEX idx_booking_attempts_ip ON public.booking_attempts(ip_address);
CREATE INDEX idx_booking_attempts_time ON public.booking_attempts(attempt_time);
CREATE INDEX idx_booking_attempts_fingerprint ON public.booking_attempts(client_fingerprint);
CREATE INDEX idx_booking_attempts_phone ON public.booking_attempts(client_phone);
CREATE INDEX idx_booking_attempts_success ON public.booking_attempts(success);

-- Таблица для блокировки пользователей по разным идентификаторам
CREATE TABLE public.blocked_clients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address inet,
    client_fingerprint text,
    phone_number text,
    email text,
    reason text NOT NULL,
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
CREATE INDEX idx_blocked_clients_active ON public.blocked_clients(is_permanent, blocked_until);

-- ============================================
-- RLS ПОЛИТИКИ
-- ============================================

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

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция для проверки блокировки пользователя
-- БЕЗ ЛИМИТОВ на количество бронирований!
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
    v_is_blocked boolean;
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
    
    -- Проверка блокировки по email
    IF p_client_email IS NOT NULL AND p_client_email != '' THEN
        SELECT EXISTS(
            SELECT 1 FROM public.blocked_clients
            WHERE email = p_client_email
            AND (is_permanent = true OR blocked_until > now())
        ) INTO v_is_blocked;
        
        IF v_is_blocked THEN
            RETURN QUERY SELECT false, 'Этот email заблокирован'::text, 0;
            RETURN;
        END IF;
    END IF;
    
    -- Все проверки пройдены - пользователь НЕ заблокирован
    -- Возвращаем успех (лимитов нет!)
    RETURN QUERY SELECT true, 'OK'::text, 999;
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

-- Функция для получения статистики попыток по пользователю
-- Помогает администратору идентифицировать вредителей
CREATE OR REPLACE FUNCTION public.get_user_booking_stats(
    p_ip_address inet DEFAULT NULL,
    p_client_fingerprint text DEFAULT NULL,
    p_client_phone text DEFAULT NULL,
    p_client_email text DEFAULT NULL,
    p_hours_back integer DEFAULT 24
)
RETURNS TABLE (
    total_attempts bigint,
    successful_attempts bigint,
    failed_attempts bigint,
    last_attempt timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::bigint as total_attempts,
        COUNT(*) FILTER (WHERE success = true)::bigint as successful_attempts,
        COUNT(*) FILTER (WHERE success = false)::bigint as failed_attempts,
        MAX(attempt_time) as last_attempt
    FROM public.booking_attempts
    WHERE attempt_time > now() - (p_hours_back || ' hours')::interval
    AND (
        (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
        OR (p_client_fingerprint IS NOT NULL AND client_fingerprint = p_client_fingerprint)
        OR (p_client_phone IS NOT NULL AND client_phone = p_client_phone)
        OR (p_client_email IS NOT NULL AND client_email = p_client_email)
    );
END;
$$;

-- Функция для получения активных бронирований пользователя
-- Помогает администратору видеть, сколько слотов занял пользователь
CREATE OR REPLACE FUNCTION public.get_client_active_bookings(
    p_client_phone text DEFAULT NULL,
    p_client_email text DEFAULT NULL,
    p_client_ip inet DEFAULT NULL
)
RETURNS TABLE (
    booking_id uuid,
    slot_date date,
    start_time time,
    end_time time,
    client_name text,
    client_phone text,
    status text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as booking_id,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        b.client_name,
        b.client_phone,
        b.status,
        b.created_at
    FROM public.bookings b
    JOIN public.time_slots ts ON b.slot_id = ts.id
    WHERE b.status IN ('pending', 'confirmed')
    AND (
        ts.slot_date > CURRENT_DATE
        OR (ts.slot_date = CURRENT_DATE AND ts.start_time > CURRENT_TIME)
    )
    AND (
        (p_client_phone IS NOT NULL AND b.client_phone = p_client_phone)
        OR (p_client_email IS NOT NULL AND b.client_email = p_client_email)
        OR (p_client_ip IS NOT NULL AND b.client_ip = p_client_ip::text)
    )
    ORDER BY ts.slot_date, ts.start_time;
END;
$$;

-- Функция для автоматической очистки старых логов
-- Рекомендуется запускать периодически через cron или pg_cron
CREATE OR REPLACE FUNCTION public.cleanup_old_booking_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Удаляем записи старше 90 дней
    DELETE FROM public.booking_attempts
    WHERE attempt_time < now() - interval '90 days';
    
    -- Удаляем истекшие временные блокировки
    DELETE FROM public.blocked_clients
    WHERE blocked_until < now()
    AND is_permanent = false;
END;
$$;

-- ============================================
-- ПРАВА ДОСТУПА
-- ============================================

GRANT EXECUTE ON FUNCTION public.check_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_booking_attempt TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_booking_stats TO service_role;
GRANT EXECUTE ON FUNCTION public.get_client_active_bookings TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_booking_attempts TO service_role;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================

COMMENT ON TABLE public.booking_attempts IS 'Логирование всех попыток бронирования для отслеживания активности пользователей';
COMMENT ON TABLE public.blocked_clients IS 'Список заблокированных пользователей (блокировка администратором)';

COMMENT ON FUNCTION public.check_rate_limit IS 'Проверяет ТОЛЬКО блокировку пользователя. Лимитов на количество бронирований НЕТ';
COMMENT ON FUNCTION public.log_booking_attempt IS 'Логирует попытку бронирования для последующего анализа';
COMMENT ON FUNCTION public.get_user_booking_stats IS 'Возвращает статистику попыток бронирования пользователя (для админа)';
COMMENT ON FUNCTION public.get_client_active_bookings IS 'Возвращает список активных бронирований пользователя (для админа)';
COMMENT ON FUNCTION public.cleanup_old_booking_attempts IS 'Очищает старые логи попыток (запускать периодически)';
