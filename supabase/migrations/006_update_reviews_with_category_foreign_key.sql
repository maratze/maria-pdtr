-- Update reviews table to use foreign key to categories
ALTER TABLE public.reviews 
DROP COLUMN IF EXISTS category;

ALTER TABLE public.reviews 
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_category_id ON public.reviews(category_id);
