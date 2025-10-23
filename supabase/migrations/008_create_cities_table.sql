-- Create cities table
CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Anyone can read cities
CREATE POLICY "enable_select_for_all"
ON public.cities
FOR SELECT
USING (true);

-- Only service_role can insert/update/delete
CREATE POLICY "enable_all_for_service_role"
ON public.cities
TO service_role
USING (true)
WITH CHECK (true);

-- Insert cities
INSERT INTO public.cities (name, slug, display_order) VALUES
    ('Москва', 'moscow', 1),
    ('Казань', 'kazan', 2),
    ('Санкт-Петербург', 'saint-petersburg', 3),
    ('Новосибирск', 'novosibirsk', 4)
ON CONFLICT (name) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cities_display_order ON public.cities(display_order);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities(slug);
