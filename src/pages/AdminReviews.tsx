import { useEffect, useState } from 'react'
import { listAllReviews, approveReview, deleteReview, uploadPhoto, updateReview, getCategories } from '../lib/reviews'
import AdminPreloader from '../components/AdminPreloader'
import CategoryDropdown from '../components/CategoryDropdown'
import StatusDropdown from '../components/StatusDropdown'
import CategoryFilterDropdown from '../components/CategoryFilterDropdown'
import ItemsPerPageDropdown from '../components/ItemsPerPageDropdown'
import Toast from '../components/Toast'
import ReviewMobileCard from '../components/ReviewMobileCard'
import ConfirmDialog from '../components/ConfirmDialog'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

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
      setToast({ message: error.message, type: 'error' })
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, approved: true } : r))
    setToast({ message: 'Отзыв одобрен', type: 'success' })
  }

  async function handleRejectReview(reviewId: string) {
    setProcessingId(reviewId)
    const { error } = await updateReview(reviewId, { approved: false })
    setProcessingId(null)

    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, approved: false } : r))
    setToast({ message: 'Отзыв возвращен на модерацию', type: 'warning' })
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
      setToast({ message: error.message, type: 'error' })
      return
    }

    // Реактивно удаляем отзыв из списка
    setReviews(reviews.filter(r => r.id !== reviewId))
    setToast({ message: 'Отзыв удален', type: 'success' })
  }

  async function handleAddPhotos(reviewId: string, files: FileList | null) {
    if (!files) return
    setProcessingId(reviewId)

    const urls: string[] = []
    for (const f of Array.from(files)) {
      const res = await uploadPhoto(f, String(reviewId), true)
      if (res.error) {
        setToast({ message: 'Ошибка загрузки фото: ' + res.error.message, type: 'error' })
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
      setToast({ message: 'Ошибка при обновлении отзыва: ' + error.message, type: 'error' })
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, photos: newPhotos } : r))
    setToast({ message: 'Фото добавлено', type: 'success' })
  }

  async function handleUpdateCategory(reviewId: string, categoryId: string | null) {
    setProcessingId(reviewId)
    const { error } = await updateReview(reviewId, { category_id: categoryId })
    setProcessingId(null)

    if (error) {
      setToast({ message: error.message, type: 'error' })
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, category_id: categoryId } : r))
    setToast({ message: 'Категория обновлена', type: 'success' })
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
      setToast({ message: 'Ошибка при удалении фото: ' + error.message, type: 'error' })
      return
    }

    // Реактивно обновляем отзыв в списке
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, photos: newPhotos } : r))
    setToast({ message: 'Фото удалено', type: 'success' })
  }

  useEffect(() => {
    load()
    loadCategories()
  }, [])

  async function loadCategories() {
    const { data, error } = await getCategories()
    if (error) {
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

  // Сброс на первую страницу при изменении фильтров или количества элементов
  useEffect(() => {
    setCurrentPage(1)
  }, [filterCategory, filterStatus, itemsPerPage])

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

  const allPendingReviews = reviews.filter(r => !r.approved)
  const allApprovedReviews = reviews.filter(r => r.approved)

  // Применяем фильтры
  let filteredReviews = reviews

  // Фильтр по статусу
  if (filterStatus === 'pending') {
    filteredReviews = filteredReviews.filter(r => !r.approved)
  } else if (filterStatus === 'approved') {
    filteredReviews = filteredReviews.filter(r => r.approved)
  }

  // Фильтр по категории
  if (filterCategory) {
    filteredReviews = filteredReviews.filter(r => r.category_id === filterCategory)
  }

  // Сортируем: сначала на модерации, потом одобренные
  const sortedReviews = [...filteredReviews.filter(r => !r.approved), ...filteredReviews.filter(r => r.approved)]

  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const paginatedReviews = sortedReviews.slice(start, end)
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage)

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">На модерации</p>
              <p className="text-2xl font-semibold text-slate-900">{allPendingReviews.length}</p>
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
              <p className="text-2xl font-semibold text-slate-900">{allApprovedReviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col gap-3">
            {/* Header row with filters label and results count */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium text-slate-700">Фильтры:</span>
              </div>

              {/* Results count - always visible */}
              <div className="text-xs sm:text-sm text-slate-500 flex-shrink-0">
                <span className="font-medium text-slate-700">{sortedReviews.length}</span> из <span className="font-medium text-slate-700">{reviews.length}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 lg:gap-2">
              {/* Filter by Status */}
              <div className="w-full sm:w-[160px]">
                <StatusDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>

              {/* Filter by Category */}
              <div className="w-full sm:w-[200px]">
                <CategoryFilterDropdown
                  categories={categories}
                  value={filterCategory}
                  onChange={setFilterCategory}
                />
              </div>

              {/* Reset Filters */}
              {(filterStatus !== 'all' || filterCategory) && (
                <button
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterCategory(null)
                  }}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reviews Table - Desktop */}
      {sortedReviews.length > 0 && (
        <section>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Автор</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Категория</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Отзыв</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Фото</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Дата</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Статус</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedReviews.map((review) => (
                    <ReviewTableRow
                      key={review.id}
                      review={review}
                      categories={categories}
                      onApprove={handleApprove}
                      onReject={handleRejectReview}
                      onDelete={handleDelete}
                      onUpdateCategory={handleUpdateCategory}
                      onUpdateMessage={handleUpdateMessage}
                      processing={processingId === review.id}
                      onShowPhotos={(photos, index) => setSelectedImageReview({ photos, index })}
                      onShowToast={(message, type) => setToast({ message, type })}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination and Items per page */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-200">
              {/* Items per page selector */}
              <div className="w-[80px]">
                <ItemsPerPageDropdown
                  value={itemsPerPage}
                  onChange={setItemsPerPage}
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                          ? 'bg-ocean-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Page info */}
              <div className="text-sm text-slate-600">
                Страница <span className="font-medium text-slate-900">{currentPage}</span> из <span className="font-medium text-slate-900">{totalPages}</span>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {paginatedReviews.map((review) => (
              <ReviewMobileCard
                key={review.id}
                review={review}
                categories={categories}
                onApprove={handleApprove}
                onReject={handleRejectReview}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
                onUpdateMessage={handleUpdateMessage}
                processing={processingId === review.id}
                onShowPhotos={(photos, index) => setSelectedImageReview({ photos, index })}
                onShowToast={(message, type) => setToast({ message, type })}
              />
            ))}
          </div>

          {/* Mobile Pagination */}
          <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-4 mt-3">
            <div className="flex flex-col gap-3">
              {/* Items per page and Page info */}
              <div className="flex items-center justify-between gap-3">
                <div className="w-[80px]">
                  <ItemsPerPageDropdown
                    value={itemsPerPage}
                    onChange={setItemsPerPage}
                  />
                </div>
                <div className="text-sm text-slate-600 text-center">
                  Страница <span className="font-medium text-slate-900">{currentPage}</span> из <span className="font-medium text-slate-900">{totalPages}</span>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex-1 max-w-[120px] px-3 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1">
                    {currentPage > 2 && (
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        1
                      </button>
                    )}
                    {currentPage > 3 && <span className="text-slate-400 px-1">...</span>}
                    {currentPage > 1 && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        {currentPage - 1}
                      </button>
                    )}
                    <button
                      className="w-10 h-10 rounded-lg bg-ocean-600 text-white text-sm font-medium"
                    >
                      {currentPage}
                    </button>
                    {currentPage < totalPages && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        {currentPage + 1}
                      </button>
                    )}
                    {currentPage < totalPages - 2 && <span className="text-slate-400 px-1">...</span>}
                    {currentPage < totalPages - 1 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex-1 max-w-[120px] px-3 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {sortedReviews.length === 0 && reviews.length > 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">Ничего не найдено</h3>
          <p className="text-sm text-slate-500 mb-3">Попробуйте изменить фильтры</p>
          <button
            onClick={() => {
              setFilterStatus('all')
              setFilterCategory(null)
            }}
            className="px-4 py-2 text-sm rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {allPendingReviews.length === 0 && allApprovedReviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
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
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4 !m-0"
          onClick={() => setSelectedImageReview(null)}
        >
          <div
            className="relative w-full max-w-[360px] sm:max-w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImageReview(null)}
              className="absolute -top-8 sm:-top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <ConfirmDialog
        isOpen={deleteConfirmId !== null && deleteConfirmType === 'review'}
        onClose={() => {
          setDeleteConfirmId(null)
          setDeleteConfirmType(null)
        }}
        onConfirm={() => deleteConfirmId && confirmDeleteReview(deleteConfirmId)}
        title="Удалить отзыв?"
        itemName={`от ${reviews.find(r => r.id === deleteConfirmId)?.name || 'Аноним'}`}
        description="Это действие невозможно будет отменить"
        confirmText="Удалить"
        confirmLoading={processingId === deleteConfirmId}
      />

      {/* Delete Photo Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null && deleteConfirmType === 'photo'}
        onClose={() => {
          setDeleteConfirmId(null)
          setDeleteConfirmType(null)
          setDeleteConfirmPhotoUrl(null)
        }}
        onConfirm={() => deleteConfirmId && deleteConfirmPhotoUrl && confirmRemovePhoto(deleteConfirmId, deleteConfirmPhotoUrl)}
        title="Удалить фото?"
        description="Это действие невозможно будет отменить"
        confirmText="Удалить"
        confirmLoading={processingId === deleteConfirmId}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

interface ReviewTableRowProps {
  review: Review
  categories: Category[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDelete: (id: string) => void
  onUpdateCategory?: (id: string, categoryId: string | null) => void
  onUpdateMessage?: (id: string, message: string) => void
  processing: boolean
  onShowPhotos?: (photos: string[], index: number) => void
  onShowToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
}

function ReviewTableRow({ review, categories, onApprove, onReject, onDelete, onUpdateCategory, onUpdateMessage, processing, onShowPhotos, onShowToast }: ReviewTableRowProps) {
  const [editedMessage, setEditedMessage] = useState(review.message)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFullMessage, setShowFullMessage] = useState(false)
  const [isTextTruncated, setIsTextTruncated] = useState(false)

  // Синхронизируем editedMessage с review.message
  useEffect(() => {
    setEditedMessage(review.message)
  }, [review.message])

  async function handleSaveMessage() {
    if (editedMessage === review.message) {
      setShowEditModal(false)
      return
    }

    setSaveLoading(true)
    const { error } = await updateReview(review.id, { message: editedMessage })
    setSaveLoading(false)

    if (error) {
      onShowToast?.('Ошибка при сохранении: ' + error.message, 'error')
      setEditedMessage(review.message)
      return
    }

    // Уведомляем родительский компонент об обновлении
    onUpdateMessage?.(review.id, editedMessage)
    setShowEditModal(false)
    onShowToast?.('Отзыв обновлен', 'success')
  }

  function handleCancelEdit() {
    setEditedMessage(review.message)
    setShowEditModal(false)
  }

  return (
    <tr className="hover:bg-slate-50">
      {/* Автор */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-900">{review.name || 'Аноним'}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-3.5 h-3.5 ${star <= review.rating
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
      </td>

      {/* Категория */}
      <td className="px-4 py-4" style={{ minWidth: '270px' }}>
        <CategoryDropdown
          categories={categories}
          value={review.category_id || null}
          onChange={(categoryId) => onUpdateCategory?.(review.id, categoryId)}
          disabled={processing || review.approved}
        />
      </td>

      {/* Отзыв */}
      <td className="px-4 py-4 max-w-md">
        <div className="group relative">
          <p
            ref={(el) => {
              if (el && !isTextTruncated) {
                setIsTextTruncated(el.scrollHeight > el.clientHeight)
              }
            }}
            className="text-sm text-slate-700 line-clamp-2"
          >
            {review.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {isTextTruncated && (
              <button
                onClick={() => setShowFullMessage(true)}
                className="text-xs text-ocean-600 hover:text-ocean-700 underline"
              >
                Показать полностью
              </button>
            )}
          </div>
        </div>

        {/* Modal для полного текста */}
        {showFullMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowFullMessage(false)}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{review.name || 'Аноним'}</h3>
                  <div className="flex items-center gap-0.5 mt-1">
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
                <button
                  onClick={() => setShowFullMessage(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{review.message}</p>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <time className="text-xs text-slate-500">
                  {new Date(review.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </div>
        )}

        {/* Modal для редактирования */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => {
            setShowEditModal(false)
            setEditedMessage(review.message)
          }}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Редактировать отзыв</h3>
                  <p className="text-sm text-slate-500 mt-1">{review.name || 'Аноним'}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditedMessage(review.message)
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 text-sm text-slate-700 resize-none"
                rows={8}
                autoFocus
              />
              <div className="flex items-center gap-3 mt-4 max-w-xs justify-self-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveMessage}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 h-10 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saveLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </td>

      {/* Фото */}
      <td className="px-4 py-4">
        {review.photos && review.photos.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {review.photos.slice(0, 3).map((photo, idx) => (
                <div
                  key={photo}
                  className="relative group w-[42px]"
                >
                  <img
                    src={photo}
                    alt={`preview-${idx}`}
                    className="w-[42px] h-16 object-cover rounded-lg border-2 border-white cursor-pointer transition-all"
                  />
                  {/* Overlay with icons on hover */}
                  <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {/* Magnifying glass in center */}
                    <button
                      onClick={() => onShowPhotos?.(review.photos || [], idx)}
                      className="absolute w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-700 transition-colors"
                      title="Увеличить"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {/* X button in top right corner */}
                  {!review.approved && (
                    <button
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        if (window._adminRemovePhoto) window._adminRemovePhoto(review.id, photo)
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100 shadow-md z-20"
                      title="Удалить фото"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {review.photos.length > 3 && (
              <div
                className="relative group w-10 h-10 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors"
                onClick={() => onShowPhotos?.(review.photos || [], 3)}
              >
                +{review.photos.length - 3}
              </div>
            )}
          </div>
        ) : (
          !review.approved && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                  if (!files) return
                  const singleFile = new DataTransfer()
                  singleFile.items.add(files[0])
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (window._adminAddPhotos) window._adminAddPhotos(review.id, singleFile.files)
                }}
                className="hidden"
              />
              <div className="w-[42px] h-16 rounded-lg border border-dashed border-slate-300 hover:border-ocean-400 flex items-center justify-center text-ocean-600 hover:text-ocean-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </label>
          )
        )}
      </td>

      {/* Дата */}
      <td className="px-4 py-4 whitespace-nowrap">
        <time className="text-xs text-slate-500">
          {new Date(review.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </time>
      </td>

      {/* Статус */}
      <td className="px-4 py-4 whitespace-nowrap">
        {review.approved ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-regular bg-emerald-50 text-emerald-700">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Одобрено
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-regular bg-amber-50 text-amber-700">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            На модерации
          </span>
        )}
      </td>

      {/* Действия */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          {!review.approved && (
            <>
              <button
                onClick={() => onApprove(review.id)}
                disabled={processing}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Одобрить отзыв"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                disabled={processing}
                className="p-2 rounded-lg text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Редактировать текст отзыва"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
          {review.approved && (
            <button
              onClick={() => onReject(review.id)}
              disabled={processing}
              className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Вернуть на модерацию"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(review.id)}
            disabled={processing}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Удалить отзыв"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
