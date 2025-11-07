-- Добавляем колонку для отслеживания общего количества забронированных слотов
-- Это позволит видеть совокупную активность пользователя по IP + телефону

ALTER TABLE public.booking_attempts
ADD COLUMN total_slots_count integer DEFAULT 0;

-- Комментарий для документации
COMMENT ON COLUMN public.booking_attempts.total_slots_count IS 'Общее количество забронированных слотов для данного IP + телефон за всё время';

-- Обновляем существующие записи, извлекая количество из client_name
-- Паттерн: "Имя (3 слота)" или "Имя (1 слот)" или "Имя (неудачная попытка)"
UPDATE public.booking_attempts
SET total_slots_count = CASE
    WHEN client_name ~ '\((\d+) слот' THEN 
        (regexp_match(client_name, '\((\d+) слот'))[1]::integer
    WHEN client_name ~ 'неудачная попытка' THEN 0
    ELSE 0
END;
