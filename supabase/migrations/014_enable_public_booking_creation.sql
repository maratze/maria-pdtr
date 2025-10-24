-- Разрешаем анонимным и авторизованным пользователям создавать слоты
-- Это нужно для онлайн-записи на сайте
CREATE POLICY "enable_insert_for_authenticated"
ON public.time_slots
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Разрешаем обновление is_booked для публичных пользователей
-- Это нужно для пометки слотов как забронированных
CREATE POLICY "enable_update_is_booked_for_all"
ON public.time_slots
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Разрешаем анонимным и авторизованным пользователям создавать бронирования
CREATE POLICY "enable_insert_for_public"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
