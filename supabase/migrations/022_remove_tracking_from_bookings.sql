-- Удаление полей отслеживания из таблицы бронирований
-- Удаляет client_ip и client_fingerprint из таблицы bookings

-- ============================================
-- УДАЛЕНИЕ ИНДЕКСОВ
-- ============================================

DROP INDEX IF EXISTS public.idx_bookings_client_ip;
DROP INDEX IF EXISTS public.idx_bookings_client_fingerprint;
DROP INDEX IF EXISTS public.idx_bookings_client_phone;
DROP INDEX IF EXISTS public.idx_bookings_client_email;

-- ============================================
-- УДАЛЕНИЕ КОЛОНОК
-- ============================================

ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS client_ip,
DROP COLUMN IF EXISTS client_fingerprint;

-- ============================================
-- КОММЕНТАРИИ
-- ============================================

COMMENT ON TABLE public.bookings IS 'Таблица бронирований (удалены поля client_ip и client_fingerprint)';
