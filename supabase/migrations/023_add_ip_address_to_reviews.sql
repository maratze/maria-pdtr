-- Добавляем колонку для хранения IP-адреса
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS ip_address text;

-- Индекс для быстрого поиска по IP (например, для выявления спама)
CREATE INDEX IF NOT EXISTS idx_reviews_ip_address ON public.reviews(ip_address);

-- Удаляем старую версию функции (без параметра p_ip_address)
DROP FUNCTION IF EXISTS public.insert_review(text, text, text, integer, jsonb);

-- Создаём новую версию функции с поддержкой IP-адреса
CREATE OR REPLACE FUNCTION public.insert_review(
  p_name text,
  p_email text,
  p_message text,
  p_rating integer,
  p_photos jsonb DEFAULT '[]'::jsonb,
  p_ip_address text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  message text,
  rating integer,
  photos jsonb,
  approved boolean,
  category_id uuid,
  ip_address text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.reviews (name, email, message, rating, photos, approved, ip_address)
  VALUES (p_name, p_email, p_message, p_rating, p_photos, false, p_ip_address)
  RETURNING reviews.id, reviews.name, reviews.email, reviews.message, 
            reviews.rating, reviews.photos, reviews.approved, reviews.category_id,
            reviews.ip_address, reviews.created_at;
END;
$$;

-- Права на выполнение (с полной сигнатурой)
GRANT EXECUTE ON FUNCTION public.insert_review(text, text, text, integer, jsonb, text) TO anon;
GRANT EXECUTE ON FUNCTION public.insert_review(text, text, text, integer, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_review(text, text, text, integer, jsonb, text) TO service_role;
