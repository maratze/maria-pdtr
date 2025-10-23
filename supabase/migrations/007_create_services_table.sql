-- Create enum for duration type
CREATE TYPE duration_type AS ENUM ('minutes', 'sessions', 'hours', 'none');

-- Create services table
CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    duration_from integer NOT NULL DEFAULT 0,
    duration_to integer NOT NULL DEFAULT 0,
    duration_type duration_type NOT NULL DEFAULT 'minutes',
    price integer NOT NULL,
    price_from boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Anyone can read services
CREATE POLICY "enable_select_for_all"
ON public.services
FOR SELECT
USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "enable_all_for_service_role"
ON public.services
TO service_role
USING (true)
WITH CHECK (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default services from the existing Services component
INSERT INTO public.services (title, description, duration_from, duration_to, duration_type, price, price_from, display_order) VALUES
    ('Базовый', 'Индивидуальный сеанс', 45, 60, 'minutes', 10000, false, 1),
    ('Денежные вопросы, проявленность', 'Индивидуальный сеанс', 60, 90, 'minutes', 15000, false, 2),
    ('Работа с установками и убеждениями', 'Индивидуальный сеанс', 60, 90, 'minutes', 15000, false, 3),
    ('Комплекс', 'Более глубокое погружение в метод P-DTR. Включает 3 сеанса.', 3, 3, 'sessions', 25000, false, 4),
    ('Индивидуальное сопровождение', 'Мое персональное сопровождение Вас до достижения желаемой цели/состояния, консультирование и коррекция. Входит 1-2 сеанса офлайн и безлимитные консультации онлайн.', 0, 0, 'none', 30000, true, 5),
    ('Обучение методу психоэмоциональной коррекции', 'Групповое обучение до 4х человек. Длительность 16 часов (4ч. теория, 10ч. практика)', 16, 16, 'hours', 40000, false, 6)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);
