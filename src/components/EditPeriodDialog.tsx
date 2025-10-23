import { useState, useEffect } from 'react'
import Dropdown from './Dropdown'
import type { City, SchedulePeriodWithCity } from '../types/booking'
import { generateSlotsForDateAndCity, type OptimizedBooking } from '../lib/slots'
import { createBookingsForSlots } from '../lib/bookings'

interface EditPeriodDialogProps {
	isOpen: boolean
	period: SchedulePeriodWithCity | null
	cities: City[]
	periods?: SchedulePeriodWithCity[]
	bookings?: OptimizedBooking[]
	onClose: () => void
	onSubmit: (periodId: string, cityId: string, startTime: string, endTime: string) => Promise<void>
	isLoading?: boolean
}

export default function EditPeriodDialog({
	isOpen,
	period,
	cities,
	periods = [],
	bookings = [],
	onClose,
	onSubmit,
	isLoading = false,
}: EditPeriodDialogProps) {
	const [selectedCity, setSelectedCity] = useState<string>('')
	const [startTime, setStartTime] = useState('10:00')
	const [endTime, setEndTime] = useState('18:00')
	const [daySlots, setDaySlots] = useState<any[]>([])

	// Состояние для выбора слотов и бронирования
	const [mode, setMode] = useState<'edit' | 'booking'>('edit')
	const [selectedSlots, setSelectedSlots] = useState<string[]>([])
	const [clientName, setClientName] = useState('')
	const [clientPhone, setClientPhone] = useState('')
	const [clientEmail, setClientEmail] = useState('')
	const [bookingError, setBookingError] = useState<string | null>(null)
	const [timeError, setTimeError] = useState<string | null>(null)

	// Проверяем наличие броней за день
	const hasBookings = daySlots.some(slot => slot.isBooked)

	// Инициализируем значения при открытии диалога
	useEffect(() => {
		if (isOpen && period) {
			setSelectedCity(period.city_id)
			setStartTime(period.work_start_time.slice(0, 5))
			setEndTime(period.work_end_time.slice(0, 5))

			// Генерируем слоты для этого дня
			const slots = generateSlotsForDateAndCity(periods, bookings, period.start_date, period.city_id)
			setDaySlots(slots)
		}
	}, [isOpen, period, periods, bookings])

	// Управляем скроллом body
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	// Сбрасываем состояния при закрытии диалога
	useEffect(() => {
		if (!isOpen) {
			setMode('edit')
			setSelectedSlots([])
			setClientName('')
			setClientPhone('')
			setClientEmail('')
			setBookingError(null)
			setTimeError(null)
		}
	}, [isOpen])

	// Проверяем валидность времени и обновляем слоты при потере фокуса
	const handleTimeBlur = () => {
		if (!period) return

		// Если есть брони, не обновляем слоты
		if (hasBookings) return

		setTimeError(null)

		if (startTime >= endTime) {
			setTimeError('Время окончания должно быть позже времени начала')
			return
		}

		// Не генерируем слоты автоматически - они будут пустыми после изменения
		// Слоты нужно будет пересоздать через submit
	}

	// Обработчик бронирования слотов
	const handleBookingSubmit = async () => {
		if (!period || selectedSlots.length === 0 || !clientName || !clientEmail || !clientPhone) {
			return
		}

		setBookingError(null)

		try {
			// Подготавливаем выбранные слоты
			const slotsToBook = selectedSlots.map(idx => {
				const slot = daySlots[parseInt(idx)]
				return {
					startTime: slot.startTime,
					endTime: slot.endTime
				}
			})

			// Создаем бронирования
			const result = await createBookingsForSlots(
				period.id,
				period.start_date,
				slotsToBook,
				clientName,
				clientPhone,
				clientEmail
			)

			if (!result.success) {
				setBookingError(result.error || 'Ошибка создания бронирования')
				return
			}

			// Успешно забронировано - закрываем диалог
			onClose()

			// Можно добавить toast notification здесь
		} catch (error) {
			console.error('Error booking slots:', error)
			setBookingError(error instanceof Error ? error.message : 'Неизвестная ошибка')
		}
	}

	if (!isOpen || !period) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!selectedCity) {
			return
		}

		if (!startTime || !endTime) {
			return
		}

		if (startTime >= endTime) {
			return
		}

		try {
			// Закрываем диалог сразу же
			setSelectedCity('')
			setStartTime('10:00')
			setEndTime('18:00')
			onClose()

			// Затем выполняем submit в фоне
			await onSubmit(period.id, selectedCity, startTime + ':00', endTime + ':00')
		} catch (err) {
			// Ошибка будет обработана в parent компоненте
			console.error('Error updating period:', err)
		}
	}

	if (!isOpen || !period) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 !m-0"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Заголовок */}
				<div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex-shrink-0">
					<div className="flex items-center gap-2">
						{mode === 'booking' && (
							<button
								onClick={() => {
									setMode('edit')
									setSelectedSlots([])
									setClientName('')
									setClientPhone('')
									setClientEmail('')
									setBookingError(null)
								}}
								className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
								title="Назад"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
						)}
						<h2 className="text-base font-regular text-slate-900">
							{new Date(period.start_date + 'T00:00:00').toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Содержимое со скроллом */}
				{mode === 'edit' ? (
					<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-ocean-300 scrollbar-track-slate-100">
						{/* Выбор города и время */}
						<div className="space-y-4">
							{/* Выбор города */}
							<div>
								<Dropdown
									options={cities.map(city => ({ id: city.id, label: city.name }))}
									value={selectedCity ? selectedCity : null}
									onChange={(value) => {
										// Если есть брони, запрещаем изменение города
										if (hasBookings) {
											setTimeError('Нельзя изменить город, так как есть забронированные слоты')
											return
										}

										if (value !== null && value !== undefined) {
											setSelectedCity(String(value))
											// Очищаем слоты при изменении города
											setDaySlots([])
											setSelectedSlots([])
										} else {
											setSelectedCity('')
										}
									}}
									label="Город"
									placeholder="Выберите город..."
									required={false}
								/>
							</div>

							{/* Время начала и окончания на одной строке */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Начало <span className="text-red-500">*</span>
									</label>
									<input
										type="time"
										value={startTime}
										onChange={(e) => {
											// Если есть брони, запрещаем изменение времени
											if (hasBookings) {
												setTimeError('Нельзя изменить время, так как есть забронированные слоты')
												return
											}
											setStartTime(e.target.value)
											// Очищаем слоты при изменении времени
											setDaySlots([])
											setSelectedSlots([])
										}}
										onBlur={handleTimeBlur}
										disabled={hasBookings}
										className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Окончание <span className="text-red-500">*</span>
									</label>
									<input
										type="time"
										value={endTime}
										onChange={(e) => {
											// Если есть брони, запрещаем изменение времени
											if (hasBookings) {
												setTimeError('Нельзя изменить время, так как есть забронированные слоты')
												return
											}
											setEndTime(e.target.value)
											// Очищаем слоты при изменении времени
											setDaySlots([])
											setSelectedSlots([])
										}}
										onBlur={handleTimeBlur}
										disabled={hasBookings}
										className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
									/>
								</div>
							</div>

							{/* Ошибка времени */}
							{timeError && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
									<div className="flex gap-2">
										<svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<p className="text-sm text-red-800">{timeError}</p>
									</div>
								</div>
							)}

							{/* Слоты за день */}
							{daySlots.length > 0 && (

								<div>
									{/* Разделитель */}
									<div className="border-t border-slate-200 mb-2"></div>

									<p className="text-sm font-medium text-slate-700 mb-3">Слоты за день ({daySlots.length}) - выберите для бронирования</p>
									<div className="grid grid-cols-2 gap-2">
										{daySlots.map((slot, idx) => (
											<button
												key={idx}
												type="button"
												onClick={() => {
													if (!slot.isBooked) {
														if (selectedSlots.includes(idx.toString())) {
															setSelectedSlots(selectedSlots.filter(s => s !== idx.toString()))
														} else {
															setSelectedSlots([...selectedSlots, idx.toString()])
														}
													}
												}}
												disabled={slot.isBooked}
												className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedSlots.includes(idx.toString())
													? 'bg-ocean-500 text-white border border-ocean-600'
													: slot.isBooked
														? 'bg-red-50 text-red-700 border border-red-200 cursor-not-allowed opacity-50'
														: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
													}`}
											>
												{slot.startTime} - {slot.endTime}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</form>
				) : (
					<form className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-ocean-300 scrollbar-track-slate-100">
						{/* Выбранные слоты */}
						<div className="p-4 bg-ocean-50 rounded-lg border border-ocean-200">
							<p className="text-xs text-slate-600 font-medium mb-2 uppercase tracking-wide">Выбранные слоты</p>
							<p className="text-sm font-medium text-ocean-700 mb-3">
								{new Date(period.start_date + 'T00:00:00').toLocaleDateString('ru-RU', {
									day: 'numeric',
									month: 'long',
									year: 'numeric',
								})}
							</p>
							<div className="flex flex-wrap gap-2">
								{selectedSlots.map((slotIdx) => {
									const slot = daySlots[parseInt(slotIdx)]
									return (
										<div
											key={slotIdx}
											className="px-3 py-1 bg-white rounded-lg border border-ocean-300 text-sm font-medium text-ocean-700"
										>
											{slot.startTime} - {slot.endTime}
										</div>
									)
								})}
							</div>
						</div>

						{/* Ошибка бронирования */}
						{bookingError && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
								<div className="flex gap-2">
									<svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-sm text-red-800">{bookingError}</p>
								</div>
							</div>
						)}

						{/* Форма бронирования */}
						<div className="space-y-4">
							<div className="border-t border-slate-200 pt-4">
								<label className="block text-sm font-medium text-slate-700 mb-2">
									ФИО <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={clientName}
									onChange={(e) => setClientName(e.target.value)}
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors"
									placeholder="Ваше имя и фамилия"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									value={clientEmail}
									onChange={(e) => setClientEmail(e.target.value)}
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors"
									placeholder="your@email.com"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Телефон <span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									value={clientPhone}
									onChange={(e) => setClientPhone(e.target.value)}
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors"
									placeholder="+7 (900) 000-00-00"
								/>
							</div>
						</div>
					</form>
				)}

				{/* Кнопки */}
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
					{mode === 'edit' ? (
						<>
							<button
								type="button"
								onClick={onClose}
								disabled={isLoading}
								className="flex-1 px-4 py-2.5 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
							>
								Отмена
							</button>
							{selectedSlots.length > 0 ? (
								<button
									type="button"
									onClick={() => {
										setMode('booking')
									}}
									className="flex-1 px-4 py-2.5 h-10 rounded-lg bg-ocean-600 text-white text-sm font-regular hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
								>
									Забронировать ({selectedSlots.length})
								</button>
							) : (
								<button
									type="button"
									onClick={handleSubmit}
									disabled={isLoading || !selectedCity || !startTime || !endTime || startTime >= endTime}
									className="flex-1 px-4 py-2.5 h-10 rounded-lg bg-green-600 text-white text-sm font-regular hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
								>
									{isLoading ? 'Сохранение...' : 'Сохранить'}
								</button>
							)}
						</>
					) : (
						<>
							<button
								type="button"
								onClick={onClose}
								disabled={isLoading}
								className="flex-1 px-4 py-2.5 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={handleBookingSubmit}
								disabled={isLoading || selectedSlots.length === 0 || !clientName || !clientEmail || !clientPhone}
								className="flex-1 px-4 py-2.5 h-10 rounded-lg bg-ocean-600 text-white text-sm font-regular hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
							>
								{isLoading ? 'Бронирование...' : `Забронировать (${selectedSlots.length})`}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
