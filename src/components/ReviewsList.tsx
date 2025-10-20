import { useEffect, useState } from 'react'
import { listApprovedReviews } from '../lib/reviews'
import type { Review } from '../types/review'

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await listApprovedReviews()
    setLoading(false)

    if (error) {
      setError(error.message || 'Не удалось загрузить отзывы')
      return
    }

    setReviews(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div>Загрузка отзывов...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!reviews.length) return <div>Пока нет отзывов.</div>

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <strong className="text-lg">{r.name || 'Аноним'}</strong>
            <span className="text-sm text-yellow-600">
              {'⭐'.repeat(r.rating)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-gray-700">{r.message}</p>
          <div className="mt-2 text-xs text-gray-500">
            {new Date(r.created_at).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
