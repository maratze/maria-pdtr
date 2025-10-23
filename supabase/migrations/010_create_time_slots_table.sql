-- Create time_slots table
CREATE TABLE public.time_slots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    period_id uuid NOT NULL REFERENCES public.schedule_periods(id) ON DELETE CASCADE,
    slot_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    is_booked boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now(),
    
    -- Уникальность слота для конкретной даты и времени в периоде
    CONSTRAINT unique_slot_per_period UNIQUE (period_id, slot_date, start_time)
);

-- Enable RLS
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can read time slots
CREATE POLICY "enable_select_for_all"
ON public.time_slots
FOR SELECT
USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "enable_all_for_service_role"
ON public.time_slots
TO service_role
USING (true)
WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_time_slots_period_id ON public.time_slots(period_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON public.time_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_time_slots_is_booked ON public.time_slots(is_booked);
CREATE INDEX IF NOT EXISTS idx_time_slots_date_available ON public.time_slots(slot_date, is_booked) WHERE is_booked = false;

-- Создаем составной индекс для быстрого поиска доступных слотов по городу и дате
CREATE INDEX IF NOT EXISTS idx_time_slots_city_date_available 
ON public.time_slots(period_id, slot_date, is_booked);
