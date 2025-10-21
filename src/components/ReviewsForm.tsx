import { useState, FormEvent, ChangeEvent } from 'react'
import { addReview, uploadPhoto } from '../lib/reviews'
import type { Review } from '../types/review'

interface ReviewsFormProps {
  onSubmitted?: (data: Review[] | null) => void
}

export default function ReviewsForm({ onSubmitted }: ReviewsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Upload photos first
    const uploadedUrls: string[] = []
    for (const f of files) {
      const res = await uploadPhoto(f)
      if (res.error) {
        setError('Ошибка загрузки фото: ' + res.error.message)
        setLoading(false)
        return
      }
      if (res.data) uploadedUrls.push(res.data)
    }

    const { data, error } = await addReview({ name, email, message, rating, photos: uploadedUrls })
    setLoading(false)

    if (error) {
      setError(error.message || 'Не удалось отправить отзыв')
      return
    }

    setName('')
    setEmail('')
    setMessage('')
    setRating(5)
    setFiles([])
    setSuccess(true)
    setIsOpen(false)

    if (onSubmitted) onSubmitted(data)

    // Hide success message after 5 seconds
    setTimeout(() => setSuccess(false), 5000)
  }

  if (!isOpen) {
    return (
      <>
        <div className="flex flex-col items-center gap-4 py-8 sm:py-12">
          <div className="text-center">
            <p className="text-sm sm:text-base text-slate-600 max-w-md mb-6">
              Поделитесь своим опытом работы с P-DTR методом.
              <br />
              Ваш отзыв очень важен для нас!
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-8 py-4 rounded-full hover:shadow-lg hover:shadow-ocean-600/30 transition-all duration-300 text-sm sm:text-base font-medium transform "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Оставить отзыв
          </button>
        </div>

        {/* Global toast notification - fixed top-right */}
        {success && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white shadow-lg border border-green-200 max-w-sm">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-regular text-slate-900">Спасибо — отзыв отправлен!</p>
                <p className="text-xs text-slate-600 mt-1">Появится в списке после модерации.</p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div
          className="bg-white rounded-xl sm:rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - как в Cases */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
            <h3 className="text-base sm:text-xl lg:text-2xl font-regular text-slate-700">Оставить отзыв</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <form id="review-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field - на отдельной строке */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Имя <span className="text-ocean-600">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/20 transition-all text-sm h-10"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email Field - на отдельной строке */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Email <span className="text-ocean-600">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/20 transition-all text-sm h-10"
                  placeholder="ivan@example.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Rating Field - Stars */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                  Оценка <span className="text-ocean-600">*</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-200 transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300 fill-slate-300'
                          }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Ваш отзыв <span className="text-ocean-600">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/20 transition-all text-sm resize-none"
                  rows={4}
                  placeholder="Расскажите о своем опыте..."
                  value={message}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Photo Upload Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 text-left">
                  Фотография (необязательно)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (!e.target.files) return
                      setFiles(Array.from(e.target.files).slice(0, 1))
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center gap-2 w-full px-3 py-3 h-11 rounded-lg border border-dashed border-slate-300 hover:border-ocean-600 bg-slate-50 hover:bg-ocean-50 transition-all cursor-pointer group"
                  >
                    <svg
                      className="w-4 h-4 text-slate-400 group-hover:text-ocean-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 group-hover:text-ocean-700 transition-colors duration-300">
                      {files.length > 0 ? `Фото загружено` : 'Добавить фото'}
                    </span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-ocean-50 text-ocean-700 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <svg
                    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <svg
                    className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-800 text-left">Спасибо за отзыв!</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Отзыв отправлен на модерацию
                    </p>
                  </div>
                </div>
              )}

            </form>
          </div>

          {/* Modal Footer - как в Cases */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex gap-3 justify-end rounded-b-xl sm:rounded-b-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2.5 rounded-lg text-slate-700 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:shadow-md transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Отправка...
                </>
              ) : (
                'Отправить'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
