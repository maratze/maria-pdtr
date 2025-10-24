import { useState, useEffect } from 'react'
import { updateReview } from '../lib/reviews'
import CategoryDropdown from './CategoryDropdown'
import type { Review, Category } from '../types/review'

interface ReviewMobileCardProps {
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

export default function ReviewMobileCard({
	review,
	categories,
	onApprove,
	onReject,
	onDelete,
	onUpdateCategory,
	onUpdateMessage,
	processing,
	onShowPhotos,
	onShowToast
}: ReviewMobileCardProps) {
	const [editedMessage, setEditedMessage] = useState(review.message)
	const [saveLoading, setSaveLoading] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [showFullMessage, setShowFullMessage] = useState(false)
	const [isTextTruncated, setIsTextTruncated] = useState(false)

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

		onUpdateMessage?.(review.id, editedMessage)
		setShowEditModal(false)
		onShowToast?.('Отзыв обновлен', 'success')
	}

	function handleCancelEdit() {
		setEditedMessage(review.message)
		setShowEditModal(false)
	}

	return (
		<>
			<div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
				{/* Header */}
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-medium text-slate-900">{review.name || 'Аноним'}</h3>
						<div className="flex items-center gap-1 mt-1">
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
						<time className="text-xs text-slate-500 mt-1 block">
							{new Date(review.created_at).toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'short',
								year: 'numeric'
							})}
						</time>
					</div>

					{/* Status */}
					{review.approved ? (
						<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-regular bg-emerald-50 text-emerald-700 flex-shrink-0">
							<span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
							Одобрено
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-regular bg-amber-50 text-amber-700 flex-shrink-0">
							<span className="w-2 h-2 bg-amber-500 rounded-full"></span>
							На модерации
						</span>
					)}
				</div>

				{/* Category */}
				<div>
					<label className="block text-xs font-medium text-slate-500 mb-1.5">Категория</label>
					<CategoryDropdown
						categories={categories}
						value={review.category_id || null}
						onChange={(categoryId) => onUpdateCategory?.(review.id, categoryId)}
						disabled={processing || review.approved}
					/>
				</div>

				{/* Message */}
				<div>
					<label className="block text-xs font-medium text-slate-500 mb-1.5">Отзыв</label>
					<p
						ref={(el) => {
							if (el && !isTextTruncated) {
								setIsTextTruncated(el.scrollHeight > el.clientHeight)
							}
						}}
						className="text-sm text-slate-700 line-clamp-3"
					>
						{review.message}
					</p>
					{isTextTruncated && (
						<button
							onClick={() => setShowFullMessage(true)}
							className="text-xs text-ocean-600 hover:text-ocean-700 underline mt-1"
						>
							Показать полностью
						</button>
					)}
				</div>

				{/* Photos */}
				{review.photos && review.photos.length > 0 ? (
					<div>
						<label className="block text-xs font-medium text-slate-500 mb-1.5">Фото</label>
						<div className="flex items-center gap-2 flex-wrap">
							{review.photos.slice(0, 3).map((photo, idx) => (
								<div
									key={photo}
									className="relative group w-20"
								>
									<img
										src={photo}
										alt={`preview-${idx}`}
										className="w-20 h-20 object-cover rounded-lg border-2 border-white cursor-pointer transition-all"
									/>
									<div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<button
											onClick={() => onShowPhotos?.(review.photos || [], idx)}
											className="w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-700 transition-colors"
											title="Увеличить"
										>
											<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
												<circle cx="11" cy="11" r="8" />
												<path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
												<path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
											</svg>
										</button>
									</div>
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
							{review.photos.length > 3 && (
								<div
									className="relative group w-20 h-20 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors"
									onClick={() => onShowPhotos?.(review.photos || [], 3)}
								>
									+{review.photos.length - 3}
								</div>
							)}
						</div>
					</div>
				) : (
					!review.approved && (
						<div>
							<label className="block text-xs font-medium text-slate-500 mb-1.5">Фото</label>
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
								<div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 hover:border-ocean-400 flex items-center justify-center text-ocean-600 hover:text-ocean-700 transition-colors">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
									</svg>
								</div>
							</label>
						</div>
					)
				)}

				{/* Actions */}
				<div className="flex items-center gap-2 pt-2 border-t border-slate-100">
					{!review.approved && (
						<>
							<button
								onClick={() => onApprove(review.id)}
								disabled={processing}
								className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-regular bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Одобрить
							</button>
							<button
								onClick={() => setShowEditModal(true)}
								disabled={processing}
								className="p-2 rounded-lg text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								title="Редактировать"
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
							className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-regular bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Вернуть
						</button>
					)}
					<button
						onClick={() => onDelete(review.id)}
						disabled={processing}
						className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						title="Удалить"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</div>
			</div>

			{/* Full Message Modal */}
			{showFullMessage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 !m-0" onClick={() => setShowFullMessage(false)}>
					<div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

			{/* Edit Modal */}
			{showEditModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 !m-0" onClick={() => {
					setShowEditModal(false)
					setEditedMessage(review.message)
				}}>
					<div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
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
						<div className="flex items-center gap-3 mt-4">
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
		</>
	)
}
