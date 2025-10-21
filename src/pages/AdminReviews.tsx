import { useEffect, useState } from 'react'
import { listAllReviews, approveReview, deleteReview, uploadPhoto, updateReview, getCategories } from '../lib/reviews'
import AdminPreloader from '../components/AdminPreloader'
import CategoryDropdown from '../components/CategoryDropdown'
import type { Review, Category } from '../types/review'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedImageReview, setSelectedImageReview] = useState<{ photos: string[], index: number } | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteConfirmType, setDeleteConfirmType] = useState<'review' | 'photo' | null>(null)
  const [deleteConfirmPhotoUrl, setDeleteConfirmPhotoUrl] = useState<string | null>(null)

  function goToNextPhoto() {
    if (!selectedImageReview) return
    const nextIndex = (selectedImageReview.index + 1) % selectedImageReview.photos.length
    setSelectedImageReview({ ...selectedImageReview, index: nextIndex })
  }

  function goToPreviousPhoto() {
    if (!selectedImageReview) return
    const prevIndex = (selectedImageReview.index - 1 + selectedImageReview.photos.length) % selectedImageReview.photos.length
    setSelectedImageReview({ ...selectedImageReview, index: prevIndex })
  }

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

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, approved: true } : r))
  }

  async function handleRejectReview(reviewId: string) {
    setProcessingId(reviewId)
    const { error } = await updateReview(reviewId, { approved: false })
    setProcessingId(null)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, approved: false } : r))
  }

  async function handleDelete(reviewId: string) {
    setDeleteConfirmId(reviewId)
    setDeleteConfirmType('review')
  }

  async function confirmDeleteReview(reviewId: string) {
    setProcessingId(reviewId)
    const { error } = await deleteReview(reviewId)
    setProcessingId(null)
    setDeleteConfirmId(null)
    setDeleteConfirmType(null)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    // Реактивно удаляем отзыв из списка
    setReviews(reviews.filter(r => r.id !== reviewId))
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

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, photos: newPhotos } : r))
  }

  async function handleUpdateCategory(reviewId: string, categoryId: string | null) {
    setProcessingId(reviewId)
    const { error } = await updateReview(reviewId, { category_id: categoryId })
    setProcessingId(null)

    if (error) {
      alert('Ошибка: ' + error.message)
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, category_id: categoryId } : r))
  }

  async function handleUpdateMessage(reviewId: string, message: string) {
    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, message } : r))
  }

  async function handleRemovePhoto(reviewId: string, photoUrl: string) {
    setDeleteConfirmId(reviewId)
    setDeleteConfirmType('photo')
    setDeleteConfirmPhotoUrl(photoUrl)
  }

  async function confirmRemovePhoto(reviewId: string, photoUrl: string) {
    setProcessingId(reviewId)
    const review = reviews.find(r => r.id === reviewId)
    const newPhotos = (review?.photos || []).filter(p => p !== photoUrl)
    const { error } = await updateReview(reviewId, { photos: newPhotos })
    setProcessingId(null)
    setDeleteConfirmId(null)
    setDeleteConfirmType(null)
    setDeleteConfirmPhotoUrl(null)

    if (error) {
      alert('Ошибка при удалении фото: ' + error.message)
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, photos: newPhotos } : r))
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
    return <AdminPreloader message="Загрузка отзывов..." />
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  const pendingReviews = reviews.filter(r => !r.approved)
  const approvedReviews = reviews.filter(r => r.approved)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">На модерации</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{pendingReviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Одобренные</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{approvedReviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            На модерации
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {pendingReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                categories={categories}
                onApprove={handleApprove}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
                onUpdateMessage={handleUpdateMessage}
                processing={processingId === review.id}
                onShowPhotos={(photos, index) => setSelectedImageReview({ photos, index })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Approved Reviews */}
      {approvedReviews.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Одобренные
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {approvedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                categories={categories}
                onReject={handleRejectReview}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
                onUpdateMessage={handleUpdateMessage}
                processing={processingId === review.id}
                onShowPhotos={(photos, index) => setSelectedImageReview({ photos, index })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {pendingReviews.length === 0 && approvedReviews.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">Нет отзывов</h3>
          <p className="text-sm text-slate-500">Все отзывы будут отображаться здесь</p>
        </div>
      )}

      {/* Image Popup Modal */}
      {selectedImageReview && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-2"
          onClick={() => setSelectedImageReview(null)}
        >
          <div
            className="relative w-full max-w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImageReview(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImageReview.photos[selectedImageReview.index]}
              alt="Full review"
              className="w-full h-auto rounded-lg"
            />

            {/* Navigation and Counter */}
            {selectedImageReview.photos.length > 1 && (
              <>
                <button
                  onClick={goToPreviousPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {selectedImageReview.index + 1} / {selectedImageReview.photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && deleteConfirmType === 'review' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-md font-medium text-slate-900">Удалить отзыв?</h3>
                <p className="text-sm text-slate-500 mt-0.5">от {reviews.find(r => r.id === deleteConfirmId)?.name || 'Аноним'}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">Это действие невозможно будет отменить</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmId(null)
                  setDeleteConfirmType(null)
                }}
                className="flex-1 px-4 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => deleteConfirmId && confirmDeleteReview(deleteConfirmId)}
                disabled={processingId === deleteConfirmId}
                className="flex-1 px-4 py-2 h-10 rounded-lg bg-red-600 text-white text-sm font-regular hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {processingId === deleteConfirmId ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Modal */}
      {deleteConfirmId && deleteConfirmType === 'photo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-md font-medium text-slate-900">Удалить фото?</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">Это действие невозможно будет отменить</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmId(null)
                  setDeleteConfirmType(null)
                  setDeleteConfirmPhotoUrl(null)
                }}
                className="flex-1 px-4 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => deleteConfirmId && deleteConfirmPhotoUrl && confirmRemovePhoto(deleteConfirmId, deleteConfirmPhotoUrl)}
                disabled={processingId === deleteConfirmId}
                className="flex-1 px-4 py-2 h-10 rounded-lg bg-red-600 text-white text-sm font-regular hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {processingId === deleteConfirmId ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ReviewCardProps {
  review: Review
  categories: Category[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onDelete: (id: string) => void
  onUpdateCategory?: (id: string, categoryId: string | null) => void
  onUpdateMessage?: (id: string, message: string) => void
  processing: boolean
  onShowPhotos?: (photos: string[], index: number) => void
}

function ReviewCard({ review, categories, onApprove, onReject, onDelete, onUpdateCategory, onUpdateMessage, processing, onShowPhotos }: ReviewCardProps) {
  const [editedMessage, setEditedMessage] = useState(review.message)
  const [saveLoading, setSaveLoading] = useState(false)

  // Синхронизируем editedMessage с review.message
  useEffect(() => {
    setEditedMessage(review.message)
  }, [review.message])

  async function handleSaveMessage() {
    if (editedMessage === review.message) {
      return
    }

    setSaveLoading(true)
    const { error } = await updateReview(review.id, { message: editedMessage })
    setSaveLoading(false)

    if (error) {
      alert('Ошибка при сохранении: ' + error.message)
      setEditedMessage(review.message)
      return
    }

    // Уведомляем родительский компонент об обновлении
    onUpdateMessage?.(review.id, editedMessage)
  }

  function handleCancelEdit() {
    setEditedMessage(review.message)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-base font-medium shadow-sm">
            {review.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-900 truncate">{review.name || 'Аноним'}</h3>
                {review.approved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Одобрено
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-300 fill-slate-300'
                      }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
        <time className="text-[13px] text-slate-500">
          {new Date(review.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </time>
      </div>

      {/* Category */}
      <div className="mb-4">
        <CategoryDropdown
          categories={categories}
          value={review.category_id || null}
          onChange={(categoryId) => onUpdateCategory?.(review.id, categoryId)}
          disabled={processing}
        />
      </div>

      {/* Message */}
      <div className="mb-2">
        {review.approved ? (
          <p className="text-md text-slate-700 leading-relaxed">{review.message}</p>
        ) : (
          <>
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 text-md text-slate-700 resize-none"
              rows={4}
            />
            {editedMessage !== review.message && (
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  onClick={handleSaveMessage}
                  disabled={saveLoading}
                  className="p-2 w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Сохранить"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saveLoading}
                  className="p-2 w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Отмена"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Photos Gallery */}
      {review.photos && review.photos.length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="grid grid-cols-4 gap-2">
            {review.photos.map((photo, idx) => (
              <div
                key={photo}
                className="relative group aspect-square cursor-pointer"
                onClick={() => onShowPhotos?.(review.photos || [], idx)}
              >
                <img
                  src={photo}
                  alt={`review-${idx}`}
                  className="w-full h-full object-cover rounded-lg border border-slate-200 group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-black/50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (window._adminRemovePhoto) window._adminRemovePhoto(review.id, photo)
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700"
                  title="Удалить фото"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3 border-t border-slate-100 mt-auto">
        {/* Add/Update photos */}
        {!review.approved && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 mt-2">
              {review.photos && review.photos.length > 0 ? 'Обновить фото' : 'Добавить фото'}
            </label>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                  if (!files) return
                  // Берем только первый файл
                  const singleFile = new DataTransfer()
                  singleFile.items.add(files[0])
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (window._adminAddPhotos) window._adminAddPhotos(review.id, singleFile.files)
                }}
                className="hidden"
              />
              <div className="w-full h-10 rounded-lg border border-dashed border-slate-300 hover:border-ocean-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-slate-600 hover:text-ocean-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Выбрать</span>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4">
        {onApprove && !review.approved && (
          <button
            onClick={() => onApprove(review.id)}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 h-10 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Обработка...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Одобрить
              </>
            )}
          </button>
        )}
        {onReject && review.approved && (
          <button
            onClick={() => onReject(review.id)}
            disabled={processing}
            className="flex-1 px-3 py-2 h-10 rounded-lg border border-amber-200 text-amber-400 text-sm font-regular hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            На модерацию
          </button>
        )}
        <button
          onClick={() => onDelete(review.id)}
          disabled={processing}
          className="px-3 py-2 h-10 rounded-lg border border-slate-200 text-red-600 text-sm font-regular hover:bg-red-50 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Удалить
        </button>
      </div>
    </div>
  )
}
