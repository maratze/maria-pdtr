import { useEffect, useState } from 'react'
import type {
	BookingFull,
	BookingFilters,
	BookingStatus,
	City,
} from '../types/booking'
import type { Service } from '../types/service'
import {
	getAllBookings,
	updateBooking,
	cancelBooking,
	getBookingStats,
} from '../lib/bookings'
import { getCities } from '../lib/cities'
import { getServices } from '../lib/services'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'

export default function AdminBookings() {
	const [bookings, setBookings] = useState<BookingFull[]>([])
	const [cities, setCities] = useState<City[]>([])
	const [services, setServices] = useState<Service[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedBooking, setSelectedBooking] = useState<BookingFull | null>(null)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)
	const [stats, setStats] = useState({
		total: 0,
		pending: 0,
		confirmed: 0,
		cancelled: 0,
		completed: 0,
	})

	// Фильтры
	const [filters, setFilters] = useState<BookingFilters>({
		city_id: '',
		status: undefined,
		date_from: '',
		date_to: '',
		service_id: '',
		search: '',
	})

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		if (!loading) {
			applyFilters()
		}
	}, [filters.city_id, filters.status, filters.service_id, filters.date_from, filters.date_to, filters.search])

	async function loadData() {
		try {
			setLoading(true)
			const [bookingsData, citiesData, servicesResult, statsData] = await Promise.all([
				getAllBookings(filters),
				getCities(),
				getServices(),
				getBookingStats(),
			])
			setBookings(bookingsData)
			setCities(citiesData)
			setServices(servicesResult.data || [])
			setStats(statsData)
		} catch (error) {
			console.error('Error loading bookings:', error)
			setToast({ message: 'Ошибка загрузки данных', type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	async function applyFilters() {
		try {
			setLoading(true)
			const bookingsData = await getAllBookings(filters)
			setBookings(bookingsData)
		} catch (error) {
			console.error('Error applying filters:', error)
			setToast({ message: 'Ошибка применения фильтров', type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	async function handleStatusChange(bookingId: string, newStatus: BookingStatus) {
		try {
			if (newStatus === 'cancelled') {
				await cancelBooking(bookingId)
			} else {
				await updateBooking(bookingId, { status: newStatus })
			}
			await loadData()
			setSelectedBooking(null)
			setToast({ message: 'Статус обновлен', type: 'success' })
		} catch (error) {
			console.error('Error updating booking status:', error)
			setToast({ message: 'Ошибка обновления статуса', type: 'error' })
		}
	}

	async function handleUpdateNotes(bookingId: string, notes: string) {
		try {
			await updateBooking(bookingId, { notes })
			await loadData()
			setToast({ message: 'Заметки сохранены', type: 'success' })
		} catch (error) {
			console.error('Error updating notes:', error)
			setToast({ message: 'Ошибка сохранения заметок', type: 'error' })
		}
	}

	const getStatusBadge = (status: BookingStatus) => {
		const styles = {
			pending: 'bg-yellow-100 text-yellow-800',
			confirmed: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
			completed: 'bg-blue-100 text-blue-800',
		}
		const labels = {
			pending: 'Ожидает',
			confirmed: 'Подтверждено',
			cancelled: 'Отменено',
			completed: 'Завершено',
		}
		return (
			<span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
				{labels[status]}
			</span>
		)
	}

	if (loading) return <AdminPreloader />

	return (
		<div className="space-y-3">
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{/* Статистика */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
				<div className="bg-white rounded-xl border border-slate-200 p-4">
					<div className="flex items-center gap-3 sm:gap-4">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<div>
							<p className="text-xl sm:text-2xl font-semibold text-slate-900">{stats.total}</p>
							<p className="text-xs sm:text-sm text-slate-500">Всего</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 p-4">
					<div className="flex items-center gap-3 sm:gap-4">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-xl sm:text-2xl font-semibold text-amber-600">{stats.pending}</p>
							<p className="text-xs sm:text-sm text-slate-500">Ожидают</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 p-4">
					<div className="flex items-center gap-3 sm:gap-4">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<div>
							<p className="text-xl sm:text-2xl font-semibold text-emerald-600">{stats.confirmed}</p>
							<p className="text-xs sm:text-sm text-slate-500">Подтверждено</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 p-4">
					<div className="flex items-center gap-3 sm:gap-4">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<div>
							<p className="text-xl sm:text-2xl font-semibold text-red-600">{stats.cancelled}</p>
							<p className="text-xs sm:text-sm text-slate-500">Отменено</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl border border-slate-200 p-4">
					<div className="flex items-center gap-3 sm:gap-4">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-xl sm:text-2xl font-semibold text-blue-600">{stats.completed}</p>
							<p className="text-xs sm:text-sm text-slate-500">Завершено</p>
						</div>
					</div>
				</div>
			</div>

			{/* Фильтры */}
			<div className="bg-white rounded-xl border border-slate-200 p-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">Город</label>
						<select
							value={filters.city_id}
							onChange={(e) => setFilters({ ...filters, city_id: e.target.value })}
							className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
						>
							<option value="">Все города</option>
							{cities.map((city) => (
								<option key={city.id} value={city.id}>
									{city.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">Статус</label>
						<select
							value={filters.status || ''}
							onChange={(e) =>
								setFilters({
									...filters,
									status: e.target.value ? (e.target.value as BookingStatus) : undefined,
								})
							}
							className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
						>
							<option value="">Все статусы</option>
							<option value="pending">Ожидает</option>
							<option value="confirmed">Подтверждено</option>
							<option value="cancelled">Отменено</option>
							<option value="completed">Завершено</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">Услуга</label>
						<select
							value={filters.service_id}
							onChange={(e) => setFilters({ ...filters, service_id: e.target.value })}
							className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
						>
							<option value="">Все услуги</option>
							{services.map((service) => (
								<option key={service.id} value={service.id}>
									{service.title}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">Поиск</label>
						<input
							type="text"
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
							placeholder="Имя, телефон, email"
							className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">Дата от</label>
						<input
							type="date"
							value={filters.date_from}
							onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
							className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">Дата до</label>
						<input
							type="date"
							value={filters.date_to}
							onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
							className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
						/>
					</div>

					<div className="sm:col-span-2 lg:col-span-2 flex items-end">
						<button
							onClick={() => {
								setFilters({
									city_id: '',
									status: undefined,
									date_from: '',
									date_to: '',
									service_id: '',
									search: '',
								})
							}}
							className="w-full bg-slate-100 text-slate-700 text-sm font-regular px-4 py-2 h-10 rounded-lg hover:bg-slate-200 transition-colors"
						>
							Сбросить фильтры
						</button>
					</div>
				</div>
			</div>

			{/* Список бронирований */}
			<div className="space-y-3">
				{bookings.length === 0 ? (
					<div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-slate-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<p className="text-slate-500 text-sm">Нет бронирований с выбранными фильтрами</p>
					</div>
				) : (
					bookings.map((booking) => (
						<div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-4">
							<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
								{/* Информация о бронировании */}
								<div className="flex-1 min-w-0">
									<div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
										<h3 className="text-base sm:text-lg font-semibold text-slate-900">
											{booking.client_name}
										</h3>
										{getStatusBadge(booking.status)}
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm">
										<div>
											<span className="text-slate-600">Телефон:</span>{' '}
											<span className="font-medium text-slate-900">{booking.client_phone}</span>
										</div>
										<div>
											<span className="text-slate-600">Email:</span>{' '}
											<span className="font-medium text-slate-900">{booking.client_email}</span>
										</div>
										<div>
											<span className="text-slate-600">Город:</span>{' '}
											<span className="font-medium text-slate-900">{booking.city?.name}</span>
										</div>
										<div>
											<span className="text-slate-600">Дата:</span>{' '}
											<span className="font-medium text-slate-900">
												{booking.time_slot?.slot_date} {booking.time_slot?.start_time.slice(0, 5)}
											</span>
										</div>
										{booking.service && (
											<div className="sm:col-span-2">
												<span className="text-slate-600">Услуга:</span>{' '}
												<span className="font-medium text-slate-900">{booking.service.title}</span>
												{booking.service.price > 0 && (
													<span className="text-slate-600 ml-2">
														({booking.service.price} ₽)
													</span>
												)}
											</div>
										)}
										{booking.notes && (
											<div className="sm:col-span-2">
												<span className="text-slate-600">Заметки:</span>{' '}
												<span className="font-medium text-slate-900">{booking.notes}</span>
											</div>
										)}
									</div>
								</div>

								{/* Действия */}
								<div className="flex flex-wrap gap-2">
									<button
										onClick={() => setSelectedBooking(booking)}
										className="text-sm px-3 py-1.5 bg-ocean-50 text-ocean-700 rounded-lg hover:bg-ocean-100 transition-colors"
									>
										Подробнее
									</button>
									{booking.status === 'pending' && (
										<button
											onClick={() => handleStatusChange(booking.id, 'confirmed')}
											className="text-sm px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
										>
											Подтвердить
										</button>
									)}
									{(booking.status === 'pending' || booking.status === 'confirmed') && (
										<button
											onClick={() => handleStatusChange(booking.id, 'cancelled')}
											className="text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
										>
											Отменить
										</button>
									)}
									{booking.status === 'confirmed' && (
										<button
											onClick={() => handleStatusChange(booking.id, 'completed')}
											className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
										>
											Завершить
										</button>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* Модальное окно с деталями */}
			{selectedBooking && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 !m-0">
					<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-5 sm:p-6">
							<div className="flex items-center justify-between mb-5 sm:mb-6">
								<h2 className="text-xl sm:text-2xl font-bold text-slate-900">Детали бронирования</h2>
								<button
									onClick={() => setSelectedBooking(null)}
									className="text-slate-400 hover:text-slate-600 transition-colors"
								>
									<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Клиент
									</label>
									<p className="text-base sm:text-lg font-semibold text-slate-900">{selectedBooking.client_name}</p>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Телефон
										</label>
										<p className="text-slate-900">{selectedBooking.client_phone}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Email
										</label>
										<p className="text-slate-900">{selectedBooking.client_email}</p>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Город
										</label>
										<p className="text-slate-900">{selectedBooking.city?.name}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Статус
										</label>
										<div>{getStatusBadge(selectedBooking.status)}</div>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Дата
										</label>
										<p className="text-slate-900">{selectedBooking.time_slot?.slot_date}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Время
										</label>
										<p className="text-slate-900">
											{selectedBooking.time_slot?.start_time.slice(0, 5)} -{' '}
											{selectedBooking.time_slot?.end_time.slice(0, 5)}
										</p>
									</div>
								</div>

								{selectedBooking.service && (
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1.5">
											Услуга
										</label>
										<p className="font-medium text-slate-900">{selectedBooking.service.title}</p>
										{selectedBooking.service.description && (
											<p className="text-sm text-slate-600 mt-1">
												{selectedBooking.service.description}
											</p>
										)}
										{selectedBooking.service.price > 0 && (
											<p className="text-sm text-slate-600 mt-1">
												Стоимость: {selectedBooking.service.price} ₽
											</p>
										)}
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Заметки администратора
									</label>
									<textarea
										defaultValue={selectedBooking.notes || ''}
										onBlur={(e) => handleUpdateNotes(selectedBooking.id, e.target.value)}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										rows={4}
										placeholder="Добавьте заметки о бронировании..."
									/>
								</div>

								<div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
									<p>Создано: {new Date(selectedBooking.created_at || '').toLocaleString('ru-RU')}</p>
									{selectedBooking.updated_at && (
										<p>Обновлено: {new Date(selectedBooking.updated_at).toLocaleString('ru-RU')}</p>
									)}
								</div>
							</div>

							<div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-200">
								<button
									onClick={() => setSelectedBooking(null)}
									className="w-full bg-slate-100 text-slate-700 text-sm font-regular px-4 py-2 h-10 rounded-lg hover:bg-slate-200 transition-colors"
								>
									Закрыть
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
