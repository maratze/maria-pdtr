-- Создаем bucket для фотографий отзывов
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-photos',
  'review-photos',
  true, -- публичный доступ для чтения
  5242880, -- 5MB лимит на файл
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Политика для загрузки фото - разрешаем всем (anon и authenticated)
CREATE POLICY "allow_upload_review_photos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'review-photos'
  AND (storage.foldername(name))[1] = 'anon' -- можно загружать только в папку anon
);

-- Политика для чтения - публичный доступ
CREATE POLICY "allow_public_read_review_photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'review-photos');

-- Политика для удаления - только service_role (для админки)
CREATE POLICY "allow_delete_review_photos_service_role"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'review-photos');
