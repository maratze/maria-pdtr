import React, { useState, useEffect } from 'react'
import { getCities } from '../lib/cities'
import { getPublicActiveSchedulePeriodsByCity } from '../lib/schedule'
import { getPublicBookingsByCityAndDates, createPublicBooking } from '../lib/bookings'
import { generateSlotsForDateAndCity } from '../lib/slots'
import Toast from './Toast'

const BookingWidget = () => {
	const [cities, setCities] = useState([])
	const [selectedCity, setSelectedCity] = useState(null)
	const [periods, setPeriods] = useState([])
	const [bookings, setBookings] = useState([])
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
				setPeriods(periodsData)

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

				const today = new Date().toISOString().split('T')[0]
				const threeMonthsLater = new Date()
				threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
				const dateEnd = threeMonthsLater.toISOString().split('T')[0]

				const bookingsData = await getPublicBookingsByCityAndDates(selectedCity, today, dateEnd)
				setBookings(bookingsData.map(b => ({
					id: b.id,
					period_id: b.period_id,
					booking_date: b.booking_date,
					start_time: b.start_time,
					end_time: b.end_time,
					service_id: null,
					client_name: '',
					client_phone: '',
					client_email: '',
					status: b.status,
					notes: null,
				})))
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
				const slots = generateSlotsForDateAndCity(periods, bookings, selectedDate, selectedCity)
				setDaySlots(slots)
			} catch (error) {
				console.error('Error loading slots:', error)
				setToast({ message: 'Ошибка загрузки слотов', type: 'error' })
			} finally {
				setLoadingSlots(false)
			}
		}
		loadSlots()
	}, [selectedDate, selectedCity, periods, bookings])

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
		const todayStr = today.toISOString().split('T')[0]

		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null)
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day)
			const dateStr = date.toISOString().split('T')[0]
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
				const bookingsData = await getPublicBookingsByCityAndDates(
					selectedCity,
					selectedDate,
					selectedDate
				)
				setBookings(prev => [...prev, ...bookingsData.map(b => ({
					id: b.id,
					period_id: b.period_id,
					booking_date: b.booking_date,
					start_time: b.start_time,
					end_time: b.end_time,
					service_id: null,
					client_name: '',
					client_phone: '',
					client_email: '',
					status: b.status,
					notes: null,
				}))])
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
					<p className="text-xs sm:text-sm text-slate-300 mb-8 break-all">
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
					<div>
						<label className="block text-xs sm:text-sm font-medium text-slate-300 mb-3">
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
									className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${selectedCity === city.id
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
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
							<div className="lg:col-span-2">
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

								<div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2 px-1">
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
													aspect-square rounded text-xs sm:text-sm font-medium transition-all
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
								<div className="lg:col-span-1">
									<h3 className="text-xs sm:text-sm font-medium text-slate-300 mb-3">
										Время на {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
											day: 'numeric',
											month: 'long'
										})}
									</h3>

									{loadingSlots ? (
										<div className="text-center py-4">
											<div className="inline-block w-6 h-6 border-4 border-ocean-300 border-t-transparent rounded-full animate-spin"></div>
										</div>
									) : daySlots.length === 0 ? (
										<p className="text-slate-400 text-center py-4 text-xs sm:text-sm">Нет доступных слотов</p>
									) : (
										<>
											<div className="space-y-2 mb-4 max-h-96 overflow-y-auto pr-2">
												{daySlots.map((slot, idx) => (
													<button
														key={idx}
														onClick={() => handleSlotSelect(slot)}
														disabled={slot.isBooked}
														className={`
															w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-medium transition-all
															${selectedSlot?.id === slot.id
																? 'bg-ocean-600 text-white border-2 border-ocean-400'
																: slot.isBooked
																	? 'bg-slate-700/50 text-slate-500 border border-slate-600 cursor-not-allowed'
																	: 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
															}
														`}
													>
														{slot.startTime} - {slot.endTime}
													</button>
												))}
											</div>

											{selectedSlot && (
												<button
													onClick={handleNextStep}
													className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded bg-ocean-600 text-white font-medium text-xs sm:text-sm hover:bg-ocean-700 transition-colors"
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
						<div className="max-w-md mx-auto lg:mx-0">
							<button
								onClick={handleBackStep}
								className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors text-xs sm:text-sm"
							>
								<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Назад
							</button>

							<div className="p-3 sm:p-4 bg-ocean-500/20 rounded border border-ocean-500/30 mb-6">
								<p className="text-xs sm:text-sm text-slate-400 mb-1">Выбранное время</p>
								<p className="text-xs sm:text-sm text-white font-medium">
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
									<label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
										ФИО <span className="text-red-400">*</span>
									</label>
									<input
										type="text"
										value={clientName}
										onChange={(e) => setClientName(e.target.value)}
										required
										className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
										placeholder="Ваше имя и фамилия"
									/>
								</div>

								<div>
									<label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
										Телефон <span className="text-red-400">*</span>
									</label>
									<input
										type="tel"
										value={clientPhone}
										onChange={(e) => setClientPhone(e.target.value)}
										required
										className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
										placeholder="+7 (900) 000-00-00"
									/>
								</div>

								<div>
									<label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
										Email <span className="text-red-400">*</span>
									</label>
									<input
										type="email"
										value={clientEmail}
										onChange={(e) => setClientEmail(e.target.value)}
										required
										className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
										placeholder="your@email.com"
									/>
								</div>

								<button
									type="submit"
									disabled={bookingLoading || !clientName || !clientPhone || !clientEmail}
									className="w-full px-3 sm:px-6 py-2 sm:py-3 rounded bg-ocean-600 text-white font-medium text-xs sm:text-sm hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{bookingLoading ? 'Создание записи...' : 'Записаться'}
								</button>
							</form>
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default BookingWidget
