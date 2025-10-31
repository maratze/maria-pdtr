-- Создаем триггер для освобождения слота при удалении бронирования
CREATE OR REPLACE FUNCTION free_slot_on_booking_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Освобождаем слот при удалении бронирования
    UPDATE public.time_slots 
    SET is_booked = false 
    WHERE id = OLD.slot_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_free_slot_on_booking_delete
AFTER DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION free_slot_on_booking_delete();
