-- Create schedule_periods table
CREATE TABLE public.schedule_periods (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
    start_date date NOT NULL,
    end_date date NOT NULL,
    work_start_time time NOT NULL,
    work_end_time time NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Валидация: end_date должна быть >= start_date
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    -- Валидация: work_end_time должна быть > work_start_time
    CONSTRAINT valid_time_range CHECK (work_end_time > work_start_time)
);

-- Enable RLS
ALTER TABLE public.schedule_periods ENABLE ROW LEVEL SECURITY;

-- Anyone can read schedule periods
CREATE POLICY "enable_select_for_all"
ON public.schedule_periods
FOR SELECT
USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "enable_all_for_service_role"
ON public.schedule_periods
TO service_role
USING (true)
WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_schedule_periods_updated_at
BEFORE UPDATE ON public.schedule_periods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schedule_periods_city_id ON public.schedule_periods(city_id);
CREATE INDEX IF NOT EXISTS idx_schedule_periods_dates ON public.schedule_periods(start_date, end_date);
