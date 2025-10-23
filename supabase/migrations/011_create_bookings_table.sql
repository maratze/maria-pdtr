-- Create booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create bookings table
CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_id uuid NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
    client_name text NOT NULL,
    client_phone text NOT NULL,
    client_email text NOT NULL,
    status booking_status NOT NULL DEFAULT 'confirmed',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Один слот может быть забронирован только один раз
    CONSTRAINT unique_slot_booking UNIQUE (slot_id)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can read bookings (для проверки доступности слотов)
CREATE POLICY "enable_select_for_all"
ON public.bookings
FOR SELECT
USING (true);

-- Only service_role can update/delete
CREATE POLICY "enable_update_delete_for_service_role"
ON public.bookings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Создаем RPC функцию для создания бронирования (обходит RLS)
-- Эта функция будет выполняться с правами SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_booking(
    p_slot_id uuid,
    p_service_id uuid,
    p_client_name text,
    p_client_phone text,
    p_client_email text
)
RETURNS TABLE (
    id uuid,
    slot_id uuid,
    service_id uuid,
    client_name text,
    client_phone text,
    client_email text,
    status booking_status,
    notes text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- Выполняется с правами создателя функции, обходя RLS
SET search_path = public
AS $$
DECLARE
    v_slot_is_booked boolean;
    v_slot_date date;
    v_slot_start_time time;
BEGIN
    -- Проверяем, доступен ли слот
    SELECT ts.is_booked, ts.slot_date, ts.start_time 
    INTO v_slot_is_booked, v_slot_date, v_slot_start_time
    FROM public.time_slots ts
    WHERE ts.id = p_slot_id;
    
    -- Проверка существования слота
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Слот не найден';
    END IF;
    
    -- Проверка что слот не занят
    IF v_slot_is_booked THEN
        RAISE EXCEPTION 'Этот слот уже забронирован';
    END IF;
    
    -- Проверка что бронирование на будущее время
    IF v_slot_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Нельзя забронировать прошедшее время';
    END IF;
    
    IF v_slot_date = CURRENT_DATE AND v_slot_start_time < CURRENT_TIME THEN
        RAISE EXCEPTION 'Нельзя забронировать прошедшее время';
    END IF;
    
    -- Создаем бронирование
    RETURN QUERY
    INSERT INTO public.bookings (
        slot_id, 
        service_id, 
        client_name, 
        client_phone, 
        client_email,
        status
    )
    VALUES (
        p_slot_id,
        p_service_id,
        p_client_name,
        p_client_phone,
        p_client_email,
        'confirmed'
    )
    RETURNING 
        bookings.id, 
        bookings.slot_id, 
        bookings.service_id, 
        bookings.client_name, 
        bookings.client_phone, 
        bookings.client_email,
        bookings.status,
        bookings.notes,
        bookings.created_at;
END;
$$;

-- Даем права на выполнение функции всем
GRANT EXECUTE ON FUNCTION public.create_booking TO anon;
GRANT EXECUTE ON FUNCTION public.create_booking TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_booking TO service_role;

-- Create trigger to update updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to mark slot as booked when booking is created
CREATE OR REPLACE FUNCTION mark_slot_as_booked()
RETURNS TRIGGER AS $$
BEGIN
    -- Отмечаем слот как забронированный
    UPDATE public.time_slots 
    SET is_booked = true 
    WHERE id = NEW.slot_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_slot_as_booked
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION mark_slot_as_booked();

-- Create trigger to free slot when booking is cancelled
CREATE OR REPLACE FUNCTION handle_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Если запись отменена, освобождаем слот
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE public.time_slots 
        SET is_booked = false 
        WHERE id = NEW.slot_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_booking_cancellation
AFTER UPDATE ON public.bookings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION handle_booking_status_change();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_client_phone ON public.bookings(client_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON public.bookings(client_email);
