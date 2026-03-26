import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.37.0'
import { crypto as stdCrypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Required env vars (set via: supabase secrets set ...)
const PAYKEEPER_URL        = Deno.env.get('PAYKEEPER_URL') ?? ''
const PAYKEEPER_API_USER   = Deno.env.get('PAYKEEPER_API_USER') ?? ''
const PAYKEEPER_API_PASS   = Deno.env.get('PAYKEEPER_API_PASS') ?? ''
const PREPAYMENT_AMOUNT    = parseInt(Deno.env.get('PAYKEEPER_PREPAYMENT_AMOUNT') ?? '500')
const RESERVATION_MINUTES  = parseInt(Deno.env.get('RESERVATION_MINUTES') ?? '15')
const SITE_URL             = Deno.env.get('SITE_URL') ?? 'https://pdtr.moscow'

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  let bookingId: string | null = null
  let bookingIds: string[] = []

  try {
    // 1. Parse and validate input
    const body = await req.json()
    // slots: array of { periodId, date, startTime, endTime }
    const { slots, clientName, clientPhone, clientEmail } = body

    if (!slots || !Array.isArray(slots) || slots.length === 0 || !clientName || !clientPhone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Basic phone format validation
    const phoneClean = clientPhone.replace(/\s/g, '')
    if (!/^\+?[78]\d{10}$/.test(phoneClean)) {
      return new Response(JSON.stringify({ error: 'Invalid phone format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Basic rate limiting
    const { data: existingPending } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_phone', phoneClean)
      .eq('payment_status', 'pending')
      .gt('reserved_until', new Date().toISOString())
      .limit(1)
    if (existingPending && existingPending.length > 0) {
      return new Response(JSON.stringify({ error: 'У вас уже есть незавершённая оплата. Подождите 15 минут или завершите оплату.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Reserve all slots atomically, one by one
    const bookingIds: string[] = []
    const totalAmount = PREPAYMENT_AMOUNT  // fixed amount regardless of slot count

    for (const slot of slots) {
      const { data: reserveData, error: reserveError } = await supabase.rpc(
        'reserve_slot_and_create_booking',
        {
          p_period_id:           slot.periodId,
          p_date:                slot.date,
          p_start_time:          slot.startTime,
          p_end_time:            slot.endTime,
          p_client_name:         clientName,
          p_client_phone:        phoneClean,
          p_client_email:        clientEmail ?? '',
          p_amount:              PREPAYMENT_AMOUNT,
          p_reservation_minutes: RESERVATION_MINUTES,
        }
      )

      if (reserveError) throw new Error(`DB error: ${reserveError.message}`)
      if (reserveData?.error === 'slot_unavailable') {
        return new Response(JSON.stringify({
          error: `slot_unavailable:${slot.date} ${slot.startTime}`,
        }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      bookingIds.push(reserveData.booking_id as string)
    }

    // Use first bookingId as the main reference (orderid for PayKeeper)
    bookingId = bookingIds[0]

    // 4. Return PayKeeper HTML form parameters
    // POST to /create/ without sign (signature checking disabled by default)
    // PayKeeper docs: https://paykeeper.alfabank.ru/metody-integratsii/html-forma/
    const successUrl = `${SITE_URL}/payment/success?booking_ids=${bookingIds.join(',')}`
    const failUrl    = `${SITE_URL}/payment/fail`

    console.log(`PayKeeper form ready, orderid=${bookingId}, bookings=${bookingIds.length}`)

    return new Response(JSON.stringify({
      bookingIds,
      formAction: `${PAYKEEPER_URL}/create/`,
      formFields: {
        sum:                  String(totalAmount),
        clientid:             phoneClean,
        orderid:              bookingId,
        service_name:         'Предоплата P-dtr',
        client_phone:         phoneClean,
        user_result_callback: successUrl,
        // fail redirect uses PayKeeper default /fail/ page
        // server callback URL must be configured in PayKeeper ЛК settings
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('create-payment error:', err instanceof Error ? err.message : err)

    // Compensating action: release the reservation if booking was created
    if (bookingIds.length > 0) {
      const { data: bData } = await supabase
        .from('bookings')
        .select('slot_id')
        .in('id', bookingIds)

      await supabase.from('bookings').delete().in('id', bookingIds)

      const slotIds = (bData ?? []).map((b: { slot_id: string }) => b.slot_id).filter(Boolean)
      if (slotIds.length > 0) {
        await supabase.from('time_slots').update({ is_booked: false }).in('id', slotIds)
      }
      console.log(`Released ${bookingIds.length} reservations after error`)
    }

    return new Response(JSON.stringify({ error: 'Не удалось создать платёж. Попробуйте позже.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
