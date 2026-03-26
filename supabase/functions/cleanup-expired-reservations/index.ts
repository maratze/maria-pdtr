import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.37.0'

// Cleanup expired payment reservations.
// Called every 2 minutes via pg_cron or Supabase scheduled function.
// Without this, slots with expired pending bookings stay permanently blocked
// because availability queries only check time_slots.is_booked = false.

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { error } = await supabase.rpc('release_expired_reservations')

    if (error) {
      console.error('Cleanup failed:', error.message)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    console.log('Expired reservations released successfully')
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error('Cleanup error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
