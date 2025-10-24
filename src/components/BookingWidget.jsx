import React, { useState, useEffect } from 'react'
import { getCities } from '../lib/cities'
import { getPublicActiveSchedulePeriodsByCity } from '../lib/schedule'
import { getPublicBookingsByCityAndDates, createPublicBooking } from '../lib/bookings'
import { getOrCreateSlotsForDate } from '../lib/timeSlots'
import Toast from './Toast'

const BookingWidget = () => {
	const [cities, setCities] = useState([])
	const [selectedCity, setSelectedCity] = useState(null)
	const [loading, setLoading] = useState(true)
	const [loadingSlots, setLoadingSlots] = useState(false)

	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(null)
	const [availableDates, setAvailableDates] = useState([])

	const [daySlots, setDaySlots] = useState([])
	const [selectedSlot, setSelectedSlot] = useState(null)

	const [step, setStep] = useState(1)
	const [clientName, setClientName] = useState('')
	const [clientPhone, setClientPhone] = useState('')
	const [clientEmail, setClientEmail] = useState('')
	const [bookingLoading, setBookingLoading] = useState(false)
	const [toast, setToast] = useState(null)

	useEffect(() => {
		async function loadCities() {
			try {
				const citiesData = await getCities()
				setCities(citiesData)
				const moscow = citiesData.find(c => c.name === 'Москва')
				if (moscow) {
					setSelectedCity(moscow.id)
				} else if (citiesData.length > 0) {
					setSelectedCity(citiesData[0].id)
				}
			} catch (error) {
				console.error('Error loading cities:', error)
				setToast({ message: 'Ошибка загрузки городов', type: 'error' })
			} finally {
				setLoading(false)
			}
		}
		loadCities()
	}, [])

	useEffect(() => {
		if (!selectedCity) return

		async function loadData() {
			try {
				setLoading(true)
				const periodsData = await getPublicActiveSchedulePeriodsByCity(selectedCity)

				const dates = new Set()
				periodsData.forEach(period => {
					const start = new Date(period.start_date + 'T00:00:00')
					const end = new Date(period.end_date + 'T00:00:00')
					const current = new Date(start)
					while (current <= end) {
						dates.add(current.toISOString().split('T')[0])
						current.setDate(current.getDate() + 1)
					}
				})
				setAvailableDates(Array.from(dates))
			} catch (error) {
				console.error('Error loading data:', error)
				setToast({ message: 'Ошибка загрузки данных', type: 'error' })
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [selectedCity])

	useEffect(() => {
		if (!selectedDate || !selectedCity) return

		async function loadSlots() {
			try {
				setLoadingSlots(true)
				// Получаем или создаём слоты из БД
				const slots = await getOrCreateSlotsForDate(selectedCity, selectedDate)
				// Преобразуем в формат для отображения
				const formattedSlots = slots.map(slot => ({
					id: slot.id,
					periodId: slot.period_id,
					date: slot.slot_date,
					startTime: slot.start_time.slice(0, 5), // HH:MM
					endTime: slot.end_time.slice(0, 5), // HH:MM
					isBooked: slot.is_booked,
				}))
				setDaySlots(formattedSlots)
			} catch (error) {
				console.error('Error loading slots:', error)
				setToast({ message: 'Ошибка загрузки слотов', type: 'error' })
			} finally {
				setLoadingSlots(false)
			}
		}
		loadSlots()
	}, [selectedDate, selectedCity])

	const generateCalendar = () => {
		const year = currentMonth.getFullYear()
		const month = currentMonth.getMonth()
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const daysInMonth = lastDay.getDate()
		const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

		const days = []
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		// Форматируем сегодняшнюю дату локально
		const todayStr = `${String(today.getFullYear()).padStart(4, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null)
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day)
			// Форматируем дату локально, без конвертации в UTC
			const year_str = String(date.getFullYear()).padStart(4, '0')
			const month_str = String(date.getMonth() + 1).padStart(2, '0')
			const day_str = String(date.getDate()).padStart(2, '0')
			const dateStr = `${year_str}-${month_str}-${day_str}`

			const isAvailable = availableDates.includes(dateStr)
			const isPast = date < today
			const isSelected = selectedDate === dateStr
			const isToday = dateStr === todayStr

			days.push({
				day,
				date: dateStr,
				isAvailable: isAvailable && !isPast,
				isPast,
				isSelected,
				isToday
			})
		}

		return days
	}

	const handleDateSelect = (dateStr) => {
		setSelectedDate(dateStr)
		setSelectedSlot(null)
		setStep(1)
	}

	const handleSlotSelect = (slot) => {
		if (!slot.isBooked) {
			setSelectedSlot(slot)
		}
	}

	const handleNextStep = () => {
		if (step === 1 && selectedSlot) {
			setStep(2)
		}
	}

	const handleBackStep = () => {
		if (step === 2) {
			setStep(1)
			setClientName('')
			setClientPhone('')
			setClientEmail('')
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!selectedSlot || !clientName || !clientPhone || !clientEmail) return

		try {
			setBookingLoading(true)
			const result = await createPublicBooking(
				selectedSlot.periodId,
				selectedSlot.date,
				selectedSlot.startTime,
				selectedSlot.endTime,
				clientName,
				clientPhone,
				clientEmail
			)

			if (result.success) {
				setStep(3)
				setToast({ message: 'Бронирование успешно создано!', type: 'success' })
				// Перезагружаем слоты, чтобы показать обновлённые данные
				const slots = await getOrCreateSlotsForDate(selectedCity, selectedDate)
				const formattedSlots = slots.map(slot => ({
					id: slot.id,
					periodId: slot.period_id,
					date: slot.slot_date,
					startTime: slot.start_time.slice(0, 5),
					endTime: slot.end_time.slice(0, 5),
					isBooked: slot.is_booked,
				}))
				setDaySlots(formattedSlots)
			} else {
				setToast({ message: result.error || 'Ошибка создания бронирования', type: 'error' })
			}
		} catch (error) {
			console.error('Error creating booking:', error)
			setToast({ message: 'Ошибка создания бронирования', type: 'error' })
		} finally {
			setBookingLoading(false)
		}
	}

	const handleReset = () => {
		setStep(1)
		setSelectedDate(null)
		setSelectedSlot(null)
		setClientName('')
		setClientPhone('')
		setClientEmail('')
	}

	const monthNames = [
		'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
	]

	const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="inline-block w-8 h-8 border-4 border-ocean-300 border-t-transparent rounded-full animate-spin"></div>
				<p className="text-slate-300 mt-4">Загрузка...</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{step === 3 ? (
				<div className="text-center py-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
						<svg className="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h3 className="text-xl sm:text-2xl font-light text-white mb-3">Запись успешно создана!</h3>
					<p className="text-sm sm:text-base text-slate-300 mb-2">
						{new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('ru-RU', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}
					</p>
					<p className="text-lg sm:text-xl text-ocean-300 mb-6">
						{selectedSlot.startTime} - {selectedSlot.endTime}
					</p>
					<p className="text-sm text-slate-300 mb-8 break-all">
						Подтверждение отправлено на {clientEmail}
					</p>
					<button
						onClick={handleReset}
						className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-ocean-600 text-white font-medium text-sm sm:text-base hover:bg-ocean-700 transition-colors"
					>
						Записаться ещё
					</button>
				</div>
			) : (
				<>
					<div className="mb-8">
						<label className="block text-sm font-medium text-slate-300 mb-3">
							Выберите город
						</label>
						<div className="flex flex-wrap gap-2">
							{cities.map(city => (
								<button
									key={city.id}
									onClick={() => {
										setSelectedCity(city.id)
										setSelectedDate(null)
										setSelectedSlot(null)
										setStep(1)
									}}
									className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm transition-all ${selectedCity === city.id
										? 'bg-ocean-600 text-white'
										: 'bg-white/5 text-slate-300 hover:bg-white/10'
										}`}
								>
									{city.name}
								</button>
							))}
						</div>
					</div>

					{step === 1 && (
						<div className="space-y-6">
							<div className="w-full">
								<div className="flex items-center justify-between mb-4">
									<button
										onClick={() => {
											const newMonth = new Date(currentMonth)
											newMonth.setMonth(newMonth.getMonth() - 1)
											setCurrentMonth(newMonth)
										}}
										className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
									>
										<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
										</svg>
									</button>
									<h3 className="text-sm sm:text-base lg:text-lg font-medium text-white">
										{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
									</h3>
									<button
										onClick={() => {
											const newMonth = new Date(currentMonth)
											newMonth.setMonth(newMonth.getMonth() + 1)
											setCurrentMonth(newMonth)
										}}
										className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
									>
										<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</div>

								<div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
									{dayNames.map(day => (
										<div key={day} className="text-center text-xs font-medium text-slate-400 py-1 sm:py-2">
											{day}
										</div>
									))}
								</div>

								<div className="grid grid-cols-7 gap-1 sm:gap-1.5">
									{generateCalendar().map((day, idx) => {
										if (!day) {
											return <div key={`empty-${idx}`} />
										}

										return (
											<button
												key={day.date}
												onClick={() => day.isAvailable && handleDateSelect(day.date)}
												disabled={!day.isAvailable}
												className={`
													aspect-square rounded text-sm font-medium transition-all
													${day.isSelected
														? 'bg-ocean-600 text-white border-2 border-ocean-500'
														: day.isToday
															? 'bg-white/5 text-slate-300 border-2 border-white/60'
															: day.isAvailable
																? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
																: day.isPast
																	? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
																	: 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
													}
												`}
											>
												{day.day}
											</button>
										)
									})}
								</div>
							</div>

							{selectedDate && (
								<div className="w-full">
									<h3 className="text-base font-regular text-slate-300 mb-4">
										Выберите время на {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
											day: 'numeric',
											month: 'long'
										})}
									</h3>

									{loadingSlots ? (
										<div className="text-center py-4">
											<div className="inline-block w-6 h-6 border-4 border-ocean-300 border-t-transparent rounded-full animate-spin"></div>
										</div>
									) : daySlots.length === 0 ? (
										<p className="text-slate-400 text-center py-4 text-sm">Нет доступных слотов на эту дату</p>
									) : (
										<>
											<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
												{daySlots.map((slot, idx) => {
													const isSelected = selectedSlot?.id === slot.id
													const isBooked = slot.isBooked

													return (
														<button
															key={idx}
															type="button"
															onClick={() => !isBooked && handleSlotSelect(slot)}
															disabled={isBooked}
															className={`
																px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all
																${isSelected
																	? 'bg-ocean-600 text-white border-2 border-ocean-400'
																	: isBooked
																		? 'bg-red-50 text-red-700 border border-red-200 cursor-not-allowed'
																		: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
																}
															`}
														>
															{slot.startTime} - {slot.endTime}
														</button>
													)
												})}
											</div>

											{selectedSlot && (
												<button
													type="button"
													onClick={handleNextStep}
													className="w-full mt-4 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 transition-colors"
												>
													Продолжить
												</button>
											)}
										</>
									)}
								</div>
							)}
						</div>
					)}

					{step === 2 && (
						<div className="space-y-4">
							<button
								onClick={handleBackStep}
								className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors text-sm"
							>
								<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Назад
							</button>

							<div className="p-3 sm:p-4 bg-ocean-500/20 rounded border border-ocean-500/30 mb-6">
								<p className="text-sm text-slate-400 mb-1">Выбранное время</p>
								<p className="text-sm text-white font-medium">
									{new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('ru-RU', {
										day: 'numeric',
										month: 'long',
										year: 'numeric'
									})}
								</p>
								<p className="text-sm sm:text-base text-ocean-300 font-medium">
									{selectedSlot.startTime} - {selectedSlot.endTime}
								</p>
							</div>

							<form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
										ФИО <span className="text-red-400">*</span>
									</label>
									<input
										type="text"
										value={clientName}
										onChange={(e) => setClientName(e.target.value)}
										required
										className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
										placeholder="Ваше имя и фамилия"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
										Телефон <span className="text-red-400">*</span>
									</label>
									<input
										type="tel"
										value={clientPhone}
										onChange={(e) => setClientPhone(e.target.value)}
										required
										className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
										placeholder="+7 (900) 000-00-00"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
										Email <span className="text-red-400">*</span>
									</label>
									<input
										type="email"
										value={clientEmail}
										onChange={(e) => setClientEmail(e.target.value)}
										required
										className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
										placeholder="your@email.com"
									/>
								</div>

								<button
									type="submit"
									disabled={bookingLoading || !clientName || !clientPhone || !clientEmail}
									className="w-full px-3 sm:px-6 py-2 sm:py-3 rounded bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{bookingLoading ? 'Создание записи...' : 'Записаться'}
								</button>
							</form>
						</div>
					)}

					{step === 3 && (
						<div className="text-center space-y-4">
							<div className="flex justify-center mb-4">
								<svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<h2 className="text-lg sm:text-xl font-bold text-white">Запись успешно создана!</h2>
							<p className="text-slate-400 text-sm sm:text-base">Мы отправили подтверждение на {clientEmail}</p>
							<button
								onClick={() => {
									setStep(0)
									setSelectedDate(null)
									setSelectedSlot(null)
									setClientName('')
									setClientPhone('')
									setClientEmail('')
								}}
								className="mt-6 px-6 py-2.5 rounded bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 transition-colors"
							>
								Готово
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default BookingWidget
