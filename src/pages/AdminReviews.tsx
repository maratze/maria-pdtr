import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { listAllReviews, approveReview, deleteReview, uploadPhoto, updateReview, getCategories } from '../lib/reviews'
import type { Review, Category } from '../types/review'

export default function AdminReviews() {
  const navigate = useNavigate()
  const { signOut } = useAdminAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error } = await listAllReviews()
    setLoading(false)

    if (error) {
      setError(error.message || 'Не удалось загрузить отзывы')
      return
    }

    setReviews(data || [])
  }

  async function handleApprove(reviewId: string) {
    setProcessingId(reviewId)
    const { error } = await approveReview(reviewId)
    setProcessingId(null)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    // Refresh list
    await load()
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return

    setProcessingId(reviewId)
    const { error } = await deleteReview(reviewId)
    setProcessingId(null)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    // Refresh list
    await load()
  }

  async function handleAddPhotos(reviewId: string, files: FileList | null) {
    if (!files) return
    setProcessingId(reviewId)

    const urls: string[] = []
    for (const f of Array.from(files)) {
      const res = await uploadPhoto(f, String(reviewId))
      if (res.error) {
        alert('Ошибка загрузки фото: ' + res.error.message)
        setProcessingId(null)
        return
      }
      if (res.data) urls.push(res.data)
    }

    // Merge new URLs into the review photos
    const review = reviews.find(r => r.id === reviewId)
    const newPhotos = [...(review?.photos || []), ...urls]
    const { error } = await updateReview(reviewId, { photos: newPhotos })
    setProcessingId(null)
    if (error) {
      alert('Ошибка при обновлении отзыва: ' + error.message)
      return
    }
    await load()
  }

  async function handleUpdateCategory(reviewId: string, categoryId: string | null) {
    setProcessingId(reviewId)
    const { error } = await updateReview(reviewId, { category_id: categoryId })
    setProcessingId(null)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    // Refresh list
    await load()
  }

  async function handleRemovePhoto(reviewId: string, photoUrl: string) {
    setProcessingId(reviewId)
    const review = reviews.find(r => r.id === reviewId)
    const newPhotos = (review?.photos || []).filter(p => p !== photoUrl)
    const { error } = await updateReview(reviewId, { photos: newPhotos })
    setProcessingId(null)

    if (error) {
      alert('Ошибка при удалении фото: ' + error.message)
      return
    }

    await load()
  }

  useEffect(() => {
    load()
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data, error } = await getCategories()
    if (error) {
      console.error('Ошибка загрузки категорий:', error)
      return
    }
    setCategories(data || [])
  }

  // Expose handlers to ReviewCard file inputs via global functions (small shortcut)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window._adminAddPhotos = handleAddPhotos
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window._adminRemovePhoto = handleRemovePhoto
    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window._adminAddPhotos = undefined
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window._adminRemovePhoto = undefined
    }
  }, [reviews])

  if (loading) {
    return <div className="p-4">Загрузка отзывов...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  const pendingReviews = reviews.filter(r => !r.approved)
  const approvedReviews = reviews.filter(r => r.approved)

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      navigate('/admin/login')
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Модерация отзывов</h1>
        <button
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
        >
          Выход
        </button>
      </div>

      {/* Pending Reviews */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold text-orange-600">
          На модерации ({pendingReviews.length})
        </h2>

        {pendingReviews.length === 0 ? (
          <div className="rounded border p-4 text-gray-500">
            Нет отзывов на модерации
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                categories={categories}
                onApprove={handleApprove}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
                processing={processingId === review.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Approved Reviews */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-green-600">
          Одобренные ({approvedReviews.length})
        </h2>

        {approvedReviews.length === 0 ? (
          <div className="rounded border p-4 text-gray-500">
            Нет одобренных отзывов
          </div>
        ) : (
          <div className="space-y-4">
            {approvedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                categories={categories}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
                processing={processingId === review.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

interface ReviewCardProps {
  review: Review
  categories: Category[]
  onApprove?: (id: string) => void
  onDelete: (id: string) => void
  onUpdateCategory?: (id: string, categoryId: string | null) => void
  processing: boolean
}

function ReviewCard({ review, categories, onApprove, onDelete, onUpdateCategory, processing }: ReviewCardProps) {
  return (
    <div className="rounded border bg-white p-4 shadow">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-lg">{review.name || 'Аноним'}</strong>
            <span className="text-sm text-yellow-600">
              {'⭐'.repeat(review.rating)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(review.created_at).toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {review.approved && (
          <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Одобрено
          </span>
        )}
      </div>

      <p className="mb-4 whitespace-pre-wrap text-gray-700">{review.message}</p>

      {/* Category selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
        <select
          value={review.category_id || ''}
          onChange={(e) => onUpdateCategory?.(review.id, e.target.value || null)}
          disabled={processing}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="">Без категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {review.photos.map((p) => (
            <div key={p} className="relative">
              <img src={p} alt="photo" className="h-28 w-full object-cover rounded" />
              <button
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (window._adminRemovePhoto) window._adminRemovePhoto(review.id, p)
                }}
                className="absolute right-1 top-1 rounded bg-red-600 px-2 py-1 text-xs text-white"
                title="Удалить фото"
              >
                ✗
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium">Добавить фото</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            // Pass files to parent via a custom event using dataset? We'll call global handler
            const files = e.target.files
            if (!files) return
            // Trigger a custom event on window so parent can pick it up
            // Simpler: call a global function `window._adminAddPhotos` if present
            // This is a small shortcut to avoid prop drilling in this example
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (window._adminAddPhotos) window._adminAddPhotos(review.id, files)
          }}
          className="mt-1"
        />
      </div>

      <div className="flex gap-2">
        {onApprove && !review.approved && (
          <button
            onClick={() => onApprove(review.id)}
            disabled={processing}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {processing ? 'Обработка...' : '✓ Одобрить'}
          </button>
        )}

        <button
          onClick={() => onDelete(review.id)}
          disabled={processing}
          className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
        >
          {processing ? 'Обработка...' : '✗ Удалить'}
        </button>
      </div>
    </div>
  )
}
