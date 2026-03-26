import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface SlotInfo {
  slot_date: string
  start_time: string
  end_time: string
}

type Status = 'polling' | 'success' | 'failed' | 'timeout' | 'not_found'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS  = 30000

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long',
  })
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookingId = searchParams.get('booking_id')

  const [status, setStatus]   = useState<Status>('polling')
  const [slot, setSlot]       = useState<SlotInfo | null>(null)
  const pollingRef             = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef             = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setStatus('not_found')
      return
    }

    const poll = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('payment_status, status, time_slots(slot_date, start_time, end_time)')
        .eq('id', bookingId)
        .single()

      if (error || !data) {
        setStatus('not_found')
        clearPolling()
        return
      }

      if (data.payment_status === 'paid') {
        setStatus('success')
        // @ts-expect-error — Supabase returns joined table as object
        setSlot(data.time_slots)
        clearPolling()
        // Clean up sessionStorage after confirmed payment
        sessionStorage.removeItem('paymentUrl')
        sessionStorage.removeItem('pendingBooking')
        sessionStorage.removeItem('bookingId')
      } else if (['failed', 'expired', 'cancelled'].includes(data.payment_status)) {
        setStatus('failed')
        clearPolling()
      }
      // else still 'pending' — keep polling
    }

    const clearPolling = () => {
      if (pollingRef.current)  clearInterval(pollingRef.current)
      if (timeoutRef.current)  clearTimeout(timeoutRef.current)
    }

    poll() // immediate first check
    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS)
    timeoutRef.current = setTimeout(() => {
      clearPolling()
      setStatus((s) => s === 'polling' ? 'timeout' : s)
    }, POLL_TIMEOUT_MS)

    return clearPolling
  }, [bookingId])

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">

        {status === 'polling' && (
          <>
            <div className="w-16 h-16 border-4 border-slate-200 border-t-ocean-600 rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Подтверждаем оплату...</h1>
            <p className="text-slate-500 text-sm">Это займёт несколько секунд</p>
          </>
        )}

        {status === 'success' && slot && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Оплата прошла!</h1>
            <p className="text-slate-600 mb-6">Ваша запись подтверждена</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-slate-500 mb-1">Дата и время</p>
              <p className="font-medium text-slate-800">{formatDate(slot.slot_date)}</p>
              <p className="text-slate-700">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</p>
            </div>
            <p className="text-xs text-slate-400 mb-6">Предоплата 500 ₽ принята. Остаток оплачивается на месте.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-medium transition-colors"
            >
              На главную
            </button>
          </>
        )}

        {(status === 'failed' || status === 'success' && !slot) && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Оплата не прошла</h1>
            <p className="text-slate-500 mb-6">Слот освобождён. Попробуйте выбрать другое время.</p>
            <button
              onClick={() => navigate('/#booking')}
              className="w-full py-3 px-6 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-medium transition-colors"
            >
              Выбрать время
            </button>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Оплата обрабатывается</h1>
            <p className="text-slate-500 mb-6">
              Если запись не появилась в течение нескольких минут — свяжитесь с нами.
            </p>
            <a
              href="tel:+7"
              className="block w-full py-3 px-6 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-medium transition-colors mb-3"
            >
              Позвонить
            </a>
            <button
              onClick={() => navigate('/')}
              className="block w-full py-3 px-6 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              На главную
            </button>
          </>
        )}

        {status === 'not_found' && (
          <>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Что-то пошло не так</h1>
            <p className="text-slate-500 mb-6">Не удалось найти информацию о записи. Свяжитесь с нами если оплата прошла.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-6 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  )
}
