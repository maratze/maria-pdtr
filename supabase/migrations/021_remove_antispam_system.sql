-- Удаление системы антиспама и безопасности
-- Удаляет таблицы blocked_clients, booking_attempts и связанные функции

-- ============================================
-- УДАЛЕНИЕ ФУНКЦИЙ
-- ============================================

-- Удаляем функцию очистки старых логов
DROP FUNCTION IF EXISTS public.cleanup_old_booking_attempts();

-- Удаляем функцию получения активных бронирований клиента
DROP FUNCTION IF EXISTS public.get_client_active_bookings(text, text, inet);

-- Удаляем функцию получения статистики попыток
DROP FUNCTION IF EXISTS public.get_user_booking_stats(inet, text, text, text, integer);

-- Удаляем функцию логирования попытки бронирования
DROP FUNCTION IF EXISTS public.log_booking_attempt(inet, text, text, text, text, boolean);

-- Удаляем функцию проверки rate limit
DROP FUNCTION IF EXISTS public.check_rate_limit(inet, text, text, text);

-- ============================================
-- УДАЛЕНИЕ ТАБЛИЦ
-- ============================================

-- Удаляем таблицу заблокированных клиентов
DROP TABLE IF EXISTS public.blocked_clients CASCADE;

-- Удаляем таблицу попыток бронирования
DROP TABLE IF EXISTS public.booking_attempts CASCADE;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================

COMMENT ON SCHEMA public IS 'Удалены таблицы blocked_clients и booking_attempts с системой антиспама';
