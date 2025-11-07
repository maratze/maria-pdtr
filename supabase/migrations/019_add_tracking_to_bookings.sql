-- Добавляем поля для отслеживания IP и fingerprint в таблицу бронирований
-- Это позволит эффективно удалять все бронирования пользователя при блокировке

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_ip inet,
ADD COLUMN IF NOT EXISTS client_fingerprint text;

-- Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_bookings_client_ip ON public.bookings(client_ip);
CREATE INDEX IF NOT EXISTS idx_bookings_client_fingerprint ON public.bookings(client_fingerprint);
CREATE INDEX IF NOT EXISTS idx_bookings_client_phone ON public.bookings(client_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON public.bookings(client_email);

-- Комментарии
COMMENT ON COLUMN public.bookings.client_ip IS 'IP адрес клиента для отслеживания и блокировки';
COMMENT ON COLUMN public.bookings.client_fingerprint IS 'Fingerprint устройства клиента для отслеживания';
