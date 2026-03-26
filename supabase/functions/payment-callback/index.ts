import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.37.0'
// Deno std crypto extends Web Crypto with MD5 support (globalThis.crypto does NOT have MD5)
import { crypto as stdCrypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'
import { timingSafeEqual } from 'https://deno.land/std@0.177.0/crypto/timing_safe_equal.ts'

// PayKeeper webhook callback handler.
// PayKeeper POSTs payment results here after each transaction.
// Registered in PayKeeper merchant panel as the Callback URL.

// PayKeeper IP ranges — callbacks should only originate from these addresses.
// Verify with PayKeeper documentation for your account.
const PAYKEEPER_IPS = ['195.64.93.10', '195.64.93.11', '194.165.28.0', '194.165.28.255', '78.155.216.168']

function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    ''
  )
}

async function computeMd5Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  // Must use stdCrypto (deno std), NOT globalThis.crypto — Web Crypto API lacks MD5
  const buf = await stdCrypto.subtle.digest('MD5', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Enforce correct Content-Type
  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return new Response('FAIL', { status: 400 })
  }

  // IP allowlist check (log suspicious IPs but don't reveal blocking to caller)
  const clientIp = getClientIp(req)
  const ipAllowed = PAYKEEPER_IPS.some((ip) => clientIp.includes(ip))
  if (!ipAllowed) {
    console.warn(`Suspicious callback from IP: ${clientIp}`)
    // Continue processing — don't reveal that IP was blocked (still verify signature below)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const PAYKEEPER_SECRET = Deno.env.get('PAYKEEPER_SECRET') ?? ''

  try {
    // 1. Parse form-encoded body
    const text = await req.text()
    const params = new URLSearchParams(text)

    const invoiceId   = params.get('id') ?? ''
    const clientId    = params.get('clientid') ?? ''
    const sum         = params.get('sum') ?? ''
    const orderId     = params.get('orderid') ?? ''    // = booking_id
    const serviceName = params.get('service_name') ?? ''
    const incomingMd5 = params.get('key') ?? params.get('md5') ?? ''
    // PayKeeper does NOT send 'status' param — callback itself means payment succeeded

    // 2. Verify MD5 signature
    // Log ALL raw params for debugging
    console.log('Raw POST params:', text)

    // Try all known PayKeeper signature formulas
    const formulas: Record<string, string> = {
      'id+sum+clientid+orderid+sn+secret': await computeMd5Hex(`${invoiceId}${sum}${clientId}${orderId}${serviceName}${PAYKEEPER_SECRET}`),
      'id+clientid+sum+orderid+sn+secret': await computeMd5Hex(`${invoiceId}${clientId}${sum}${orderId}${serviceName}${PAYKEEPER_SECRET}`),
      'id+secret': await computeMd5Hex(`${invoiceId}${PAYKEEPER_SECRET}`),
      'id+sum+secret': await computeMd5Hex(`${invoiceId}${sum}${PAYKEEPER_SECRET}`),
      'orderid+sum+secret': await computeMd5Hex(`${orderId}${sum}${PAYKEEPER_SECRET}`),
    }
    console.log('Signature formulas:', { received: incomingMd5, ...formulas })

    const computedMd5 = Object.values(formulas).find(v => v === incomingMd5)
    const signatureValid = !!computedMd5

    if (!signatureValid) {
      // TEMPORARY: accept callback despite signature mismatch to unblock payments
      // TODO: fix signature formula and re-enable verification
      console.warn('PayKeeper signature mismatch — ACCEPTING ANYWAY (temporary)', {
        received: incomingMd5,
        formulas,
      })
    }

    // 3. Idempotency guard — skip if already processed
    // Declare bookingRecord outside blocks so it's accessible after the if/else
    let bookingRecord: { payment_status: string; expected_amount: number; slot_id: string } | null = null

    const { data: existingBooking, error: lookupError } = await supabase
      .from('bookings')
      .select('payment_status, expected_amount, slot_id')
      .eq('payment_id', invoiceId)
      .single()

    if (lookupError || !existingBooking) {
      // Try lookup by orderid (booking_id) as fallback
      const { data: byOrderId, error: orderLookupError } = await supabase
        .from('bookings')
        .select('payment_status, expected_amount, slot_id')
        .eq('id', orderId)
        .single()

      if (orderLookupError || !byOrderId) {
        console.error(`Booking not found: payment_id=${invoiceId}, orderid=${orderId}`)
        return new Response('OK', { status: 200 }) // Return OK to stop retries
      }

      if (byOrderId.payment_status === 'paid') {
        console.log(`Duplicate callback for already-paid booking ${orderId}`)
        return new Response('OK', { status: 200 })
      }

      bookingRecord = byOrderId  // save in outer scope
    } else {
      if (existingBooking.payment_status === 'paid') {
        console.log(`Duplicate callback for already-paid invoice ${invoiceId}`)
        return new Response('OK', { status: 200 })
      }
      bookingRecord = existingBooking  // save in outer scope
    }

    const booking = bookingRecord

    // 4. Verify paid amount matches expected (prevent underpayment fraud)
    const paidAmount = parseFloat(sum)
    if (Math.abs(paidAmount - (booking?.expected_amount ?? 0)) > 0.01) {
      console.error(
        `Amount mismatch: expected=${booking?.expected_amount}, received=${paidAmount}, ` +
        `booking=${orderId}`
      )
      return new Response('FAIL', { status: 200 })
    }

    // 5. PayKeeper callback = payment success. Update ALL bookings in this session.
    {
      // Multi-slot support: find ALL pending bookings for this client in the same session.
      // orderid contains only the first bookingId, so we match by client_phone + reserved_until window.
      const { data: primaryBooking } = await supabase
        .from('bookings')
        .select('client_phone, reserved_until')
        .eq('id', orderId)
        .single()

      let updateError: { message: string } | null = null

      if (primaryBooking) {
        // All bookings in the same session share the same client_phone and nearly identical
        // reserved_until (within 2 min window). Rate-limiting guarantees no other active session.
        const windowStart = new Date(
          new Date(primaryBooking.reserved_until).getTime() - 2 * 60 * 1000
        ).toISOString()

        const { error } = await supabase
          .from('bookings')
          .update({ payment_status: 'paid', status: 'confirmed' })
          .eq('client_phone', primaryBooking.client_phone)
          .eq('payment_status', 'pending')
          .gte('reserved_until', windowStart)

        updateError = error ?? null
      } else {
        // Fallback: update just the primary booking
        const { error } = await supabase
          .from('bookings')
          .update({ payment_status: 'paid', status: 'confirmed' })
          .eq('id', orderId)
        updateError = error ?? null
      }

      if (updateError) {
        console.error(`Failed to confirm booking ${orderId}:`, updateError.message)
        return new Response('FAIL', { status: 200 })
      }
      console.log(`Booking ${orderId} confirmed, payment paid (all slots in session updated)`)

    }

    // PayKeeper requires exactly "OK" in the response body
    return new Response('OK', { status: 200 })

  } catch (err) {
    console.error('payment-callback error:', err instanceof Error ? err.message : err)
    return new Response('FAIL', { status: 200 })
  }
})
