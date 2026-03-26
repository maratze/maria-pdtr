import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaymentFail() {
  const navigate = useNavigate()

  // Clear any pending payment sessionStorage so the BookingWidget
  // doesn't show the "you returned from payment" banner on next visit
  useEffect(() => {
    sessionStorage.removeItem('paymentUrl')
    sessionStorage.removeItem('pendingBooking')
    sessionStorage.removeItem('bookingId')
  }, [])

  const handleRetry = () => {
    // Redirect to homepage with anchor to booking widget
    navigate('/')
    // Small delay to allow navigation, then scroll to booking section
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Оплата не прошла</h1>
        <p className="text-slate-500 mb-8">
          Слот освобождён. Выберите удобное время и попробуйте снова.
        </p>

        <button
          onClick={handleRetry}
          className="w-full py-3 px-6 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-medium transition-colors mb-3"
        >
          Выбрать время
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 px-6 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          На главную
        </button>
      </div>
    </div>
  )
}
