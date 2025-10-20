-- Add category column to reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS category text DEFAULT NULL;

-- Create index for faster queries on category
CREATE INDEX IF NOT EXISTS idx_reviews_category ON public.reviews(category);
