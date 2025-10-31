import { useEffect, useState } from 'react'
import type { TimeSlot, BookingWithDetails } from '../types/booking'
import { getBookingsBySlot, deleteBooking } from '../lib/bookings'
import Toast from './Toast'
import ConfirmDialog from './ConfirmDialog'

interface SlotDetailsDialogProps {
	isOpen: boolean
	slot: TimeSlot | null
	onClose: () => void
	onBookingDeleted?: () => void
}

export default function SlotDetailsDialog({ isOpen, slot, onClose, onBookingDeleted }: SlotDetailsDialogProps) {
	const [bookings, setBookings] = useState<BookingWithDetails[]>([])
	const [loading, setLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{ bookingId: string; clientName: string } | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		if (isOpen && slot) {
			loadBookings()
		}
	}, [isOpen, slot])

	async function loadBookings() {
		if (!slot) return

		try {
			setLoading(true)
			const data = await getBookingsBySlot(slot.id)
			setBookings(data)
		} catch (error) {
			console.error('Error loading bookings:', error)
			setToast({ message: 'Ошибка загрузки бронирований', type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	async function handleDeleteBooking() {
		if (!deleteConfirm) return

		try {
			setDeleteLoading(true)
			await deleteBooking(deleteConfirm.bookingId)
			setToast({ message: 'Бронирование успешно удалено', type: 'success' })
			setDeleteConfirm(null)

			// Перезагружаем бронирования
			await loadBookings()

			// Вызываем колбэк для обновления родительского компонента
			if (onBookingDeleted) {
				onBookingDeleted()
			}
		} catch (error) {
			console.error('Error deleting booking:', error)
			setToast({ message: 'Ошибка при удалении бронирования', type: 'error' })
		} finally {
			setDeleteLoading(false)
		}
	}

	if (!isOpen || !slot) return null

	const statusConfig: Record<string, { label: string; color: string }> = {
		pending: { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-800' },
		confirmed: { label: 'Подтверждено', color: 'bg-blue-100 text-blue-800' },
		cancelled: { label: 'Отменено', color: 'bg-red-100 text-red-800' },
		completed: { label: 'Завершено', color: 'bg-emerald-100 text-emerald-800' },
	}

	return (
		<>
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{/* Затемненный фон */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
				onClick={onClose}
			/>

			{/* Модальное окно */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
					{/* Заголовок */}
					<div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
						<h2 className="text-xl font-semibold text-slate-900">
							Информация о слоте
						</h2>
						<button
							onClick={onClose}
							className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Содержимое */}
					<div className="px-6 py-4 space-y-6">
						{/* Информация о слоте */}
						<div className="space-y-3">
							<h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
								Данные слота
							</h3>
							<div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
								<div>
									<p className="text-xs text-slate-500 mb-1">Дата</p>
									<p className="text-sm font-medium text-slate-900">
										{new Date(slot.slot_date + 'T00:00:00').toLocaleDateString(
											'ru-RU',
											{
												weekday: 'long',
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											}
										)}
									</p>
								</div>
								<div>
									<p className="text-xs text-slate-500 mb-1">Время</p>
									<p className="text-sm font-medium text-slate-900">
										{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
									</p>
								</div>
								<div className="col-span-2">
									<p className="text-xs text-slate-500 mb-1">Статус</p>
									<span
										className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${slot.is_booked
											? 'bg-red-100 text-red-800'
											: 'bg-emerald-100 text-emerald-800'
											}`}
									>
										{slot.is_booked ? 'Забронировано' : 'Свободно'}
									</span>
								</div>
							</div>
						</div>

						{/* Бронирования */}
						<div className="space-y-3">
							<h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
								Бронирования ({bookings.length})
							</h3>

							{loading ? (
								<div className="text-center py-8">
									<div className="inline-block">
										<svg
											className="w-8 h-8 text-slate-400 animate-spin"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
											/>
										</svg>
									</div>
								</div>
							) : bookings.length === 0 ? (
								<div className="text-center py-8 text-slate-500">
									<svg
										className="w-8 h-8 mx-auto mb-2 text-slate-300"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									<p>На этот слот бронирований нет</p>
								</div>
							) : (
								<div className="space-y-3 max-h-[400px] overflow-y-auto">
									{bookings.map((booking) => {
										const status =
											statusConfig[booking.status as keyof typeof statusConfig] ||
											statusConfig.pending
										return (
											<div
												key={booking.id}
												className="p-4 border border-slate-200 rounded-lg hover:border-ocean-300 transition-colors"
											>
												{/* Заголовок бронирования */}
												<div className="flex items-start justify-between mb-3">
													<div>
														<p className="text-sm font-semibold text-slate-900">
															{booking.client_name}
														</p>
														<p className="text-xs text-slate-500">
															ID: {booking.id.slice(0, 8)}...
														</p>
													</div>
													<span
														className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
													>
														{status.label}
													</span>
												</div>

												{/* Контактная информация */}
												<div className="space-y-2 mb-3 pb-3 border-b border-slate-200">
													<div className="flex items-center gap-2 text-sm">
														<svg
															className="w-4 h-4 text-slate-400 flex-shrink-0"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
															/>
														</svg>
														<a
															href={`mailto:${booking.client_email}`}
															className="text-ocean-600 hover:underline"
														>
															{booking.client_email}
														</a>
													</div>
													<div className="flex items-center gap-2 text-sm">
														<svg
															className="w-4 h-4 text-slate-400 flex-shrink-0"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
															/>
														</svg>
														<a
															href={`tel:${booking.client_phone}`}
															className="text-ocean-600 hover:underline"
														>
															{booking.client_phone}
														</a>
													</div>
												</div>

												{/* Услуга и дополнительная информация */}
												<div className="space-y-2 text-sm">
													{booking.service && (
														<div>
															<p className="text-xs text-slate-500 mb-1">Услуга</p>
															<p className="font-medium text-slate-900">
																{booking.service.title}
																{booking.service.price && (
																	<span className="text-slate-500 font-normal">
																		{' '}
																		- {booking.service.price} ₽
																	</span>
																)}
															</p>
														</div>
													)}

													{booking.notes && (
														<div>
															<p className="text-xs text-slate-500 mb-1">Примечания</p>
															<p className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
																{booking.notes}
															</p>
														</div>
													)}

													<div className="flex items-center justify-between">
														<p className="text-xs text-slate-500">
															Создано:{' '}
															{new Date(booking.created_at || '').toLocaleDateString(
																'ru-RU',
																{
																	year: 'numeric',
																	month: 'short',
																	day: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit',
																}
															)}
														</p>
														<button
															onClick={() => setDeleteConfirm({ bookingId: booking.id, clientName: booking.client_name })}
															className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
														>
															Удалить
														</button>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Диалог подтверждения удаления */}
			<ConfirmDialog
				isOpen={deleteConfirm !== null}
				onClose={() => setDeleteConfirm(null)}
				onConfirm={handleDeleteBooking}
				title="Удалить бронирование?"
				description="Это действие нельзя отменить. Слот станет доступным для бронирования."
				itemName={deleteConfirm?.clientName}
				confirmText="Удалить"
				confirmLoading={deleteLoading}
				variant="danger"
			/>
		</>
	)
}
