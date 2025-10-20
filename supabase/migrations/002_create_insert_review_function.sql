-- Создаем функцию для добавления отзывов, которая обходит RLS
-- Эта функция будет выполняться с правами SECURITY DEFINER (как владелец)

CREATE OR REPLACE FUNCTION public.insert_review(
  p_name text,
  p_email text,
  p_message text,
  p_rating integer,
  p_photos jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  message text,
  rating integer,
  photos jsonb,
  approved boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- Выполняется с правами создателя функции (postgres), обходя RLS
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.reviews (name, email, message, rating, photos, approved)
  VALUES (p_name, p_email, p_message, p_rating, p_photos, false)
  RETURNING reviews.id, reviews.name, reviews.email, reviews.message, 
            reviews.rating, reviews.photos, reviews.approved, reviews.created_at;
END;
$$;

-- Даем права на выполнение функции всем
GRANT EXECUTE ON FUNCTION public.insert_review TO anon;
GRANT EXECUTE ON FUNCTION public.insert_review TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_review TO service_role;
