-- Create categories table
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY "enable_select_for_all"
ON public.categories
FOR SELECT
USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "enable_all_for_service_role"
ON public.categories
TO service_role
USING (true)
WITH CHECK (true);

-- Insert default categories
INSERT INTO public.categories (name, display_order) VALUES
    ('Физическая боль', 1),
    ('Эмоциональные проблемы', 2),
    ('Финансовые блоки', 3),
    ('Отношения', 4),
    ('Карьера', 5),
    ('Здоровье', 6)
ON CONFLICT (name) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);
