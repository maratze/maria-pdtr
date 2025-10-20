-- Drop everything and start fresh
-- This migration completely recreates the reviews table and RLS policies

-- Drop the table if it exists (CASCADE will drop all policies too)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Create the reviews table
CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    photos jsonb DEFAULT '[]'::jsonb,
    approved boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Включаем Row Level Security и добавляем безопасные политики
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Разрешаем INSERT всем (без ограничений по ролям)
CREATE POLICY "enable_insert_for_all"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Разрешаем SELECT только для одобренных отзывов
CREATE POLICY "enable_select_for_approved"
ON public.reviews
FOR SELECT
USING (approved = true);

-- Для service_role разрешаем всё (UPDATE, DELETE, SELECT всех записей)
CREATE POLICY "enable_all_for_service_role"
ON public.reviews
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for faster queries on approved status
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
