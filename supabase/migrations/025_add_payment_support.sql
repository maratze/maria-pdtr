-- Migration: Add payment support for PayKeeper (Alfa-Bank) prepayment integration
-- Adds payment_status, payment_id, expected_amount, reserved_until to bookings table
-- Creates atomic slot reservation function and expired reservation cleanup function

-- 1. New columns on bookings table
ALTER TABLE public.bookings
  ADD COLUMN payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired')),
  ADD COLUMN payment_id     text,
  ADD COLUMN expected_amount integer NOT NULL DEFAULT 500,
  ADD COLUMN reserved_until timestamptz;

-- Index for fast payment_id lookup in callback handler
CREATE INDEX idx_bookings_payment_id ON public.bookings(payment_id);

-- Fix existing bookings: they were created without payment, so mark as paid
-- (confirmed = already booked and valid, cancelled = no slot needed)
UPDATE public.bookings SET payment_status = 'paid'     WHERE status = 'confirmed';
UPDATE public.bookings SET payment_status = 'paid'     WHERE status = 'completed';
UPDATE public.bookings SET payment_status = 'expired'  WHERE status = 'cancelled';

-- 2. Atomic slot reservation with row-level lock
-- Uses FOR UPDATE SKIP LOCKED to prevent double-booking under concurrent requests
CREATE OR REPLACE FUNCTION reserve_slot_and_create_booking(
  p_period_id         uuid,
  p_date              date,
  p_start_time        time,
  p_end_time          time,
  p_client_name       text,
  p_client_phone      text,
  p_client_email      text,
  p_amount            integer,
  p_reservation_minutes integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_id   uuid;
  v_booking_id uuid;
BEGIN
  -- Acquire exclusive row lock on the target slot.
  -- SKIP LOCKED: if another transaction holds the lock, return nothing immediately.
  SELECT id INTO v_slot_id
  FROM public.time_slots
  WHERE period_id  = p_period_id
    AND slot_date  = p_date
    AND start_time = p_start_time
    AND is_booked  = false
  FOR UPDATE SKIP LOCKED;

  IF v_slot_id IS NULL THEN
    RETURN jsonb_build_object('error', 'slot_unavailable');
  END IF;

  -- Mark slot as booked (the existing trigger mark_slot_as_booked will also fire
  -- on INSERT below — that is idempotent and harmless)
  UPDATE public.time_slots SET is_booked = true WHERE id = v_slot_id;

  -- Create the booking with pending payment status and reservation expiry
  INSERT INTO public.bookings (
    slot_id,
    client_name,
    client_phone,
    client_email,
    status,
    payment_status,
    expected_amount,
    reserved_until
  ) VALUES (
    v_slot_id,
    p_client_name,
    p_client_phone,
    p_client_email,
    'pending',
    'pending',
    p_amount,
    now() + (p_reservation_minutes || ' minutes')::interval
  )
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'slot_id',    v_slot_id
  );
END;
$$;

-- 3. Cleanup function for expired reservations
-- Must be called regularly (every 2 min via cron) because all availability queries
-- only check is_booked=false on time_slots — they do not join bookings table.
-- Without this cleanup, expired slots stay permanently blocked.
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Free the time slots for expired reservations
  UPDATE public.time_slots ts
  SET is_booked = false
  FROM public.bookings b
  WHERE b.slot_id          = ts.id
    AND b.payment_status   = 'pending'
    AND b.reserved_until   < now();

  -- DELETE expired booking rows (not just mark cancelled).
  -- REASON: bookings has UNIQUE(slot_id) constraint. If we only set status='cancelled',
  -- the row stays and blocks any future INSERT for the same slot_id.
  -- Deleting allows the slot to be re-booked after the reservation expires.
  -- The trigger free_slot_on_booking_delete also fires here (idempotent, slot already freed above).
  DELETE FROM public.bookings
  WHERE payment_status = 'pending'
    AND reserved_until < now();
END;
$$;

-- 4. Grant execute permissions for new functions
GRANT EXECUTE ON FUNCTION public.reserve_slot_and_create_booking TO service_role;
GRANT EXECUTE ON FUNCTION public.release_expired_reservations TO service_role;
GRANT EXECUTE ON FUNCTION public.release_expired_reservations TO authenticated;

-- 5. Schedule automatic cleanup every 2 minutes via pg_cron
-- Run this in Supabase Dashboard → SQL Editor after enabling pg_cron extension:
--
-- SELECT cron.schedule(
--   'cleanup-expired-reservations',
--   '*/2 * * * *',
--   $$SELECT release_expired_reservations()$$
-- );
--
-- If pg_cron is not available, deploy the cleanup-expired-reservations Edge Function
-- with a cron schedule via: supabase functions deploy cleanup-expired-reservations
