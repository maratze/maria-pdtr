import React, { useState, useEffect } from 'react'
import { getCities } from '../lib/cities'
import { getPublicActiveSchedulePeriodsByCity } from '../lib/schedule'
import { getPublicBookingsByCityAndDates, createPublicBooking } from '../lib/bookings'
import { getOrCreateSlotsForDate, getAvailableSlotsByCityAndDateRange } from '../lib/timeSlots'
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
	const [selectedSlots, setSelectedSlots] = useState([])

	const [step, setStep] = useState(1)
	const [clientName, setClientName] = useState('')
	const [clientPhone, setClientPhone] = useState('')
	const [clientEmail, setClientEmail] = useState('')
	const [bookingLoading, setBookingLoading] = useState(false)
	const [toast, setToast] = useState(null)
	const [localError, setLocalError] = useState(null)

	// Валидация email и телефона
	const [emailError, setEmailError] = useState('')
	const [phoneError, setPhoneError] = useState('')

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

				if (periodsData.length === 0) {
					setAvailableDates([])
					setLoading(false)
					return
				}

				// Находим минимальную и максимальную даты периодов
				let minDate = periodsData[0].start_date
				let maxDate = periodsData[0].end_date

				periodsData.forEach(period => {
					if (period.start_date < minDate) minDate = period.start_date
					if (period.end_date > maxDate) maxDate = period.end_date
				})

				// Получаем все доступные слоты для города в диапазоне дат одним запросом
				const availableSlots = await getAvailableSlotsByCityAndDateRange(selectedCity, minDate, maxDate)

				// Собираем уникальные даты с доступными слотами
				const datesWithAvailableSlots = new Set()
				availableSlots.forEach(slot => {
					datesWithAvailableSlots.add(slot.slot_date)
				})

				setAvailableDates(Array.from(datesWithAvailableSlots))
			} catch (error) {
				console.error('Error loading available dates:', error)
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
				// Преобразуем в формат для отображения - показываем только доступные слоты
				const formattedSlots = slots
					.filter(slot => !slot.is_booked) // Фильтруем только незабронированные
					.map(slot => ({
						id: slot.id,
						periodId: slot.period_id,
						date: slot.slot_date,
						startTime: slot.start_time.slice(0, 5), // HH:MM
						endTime: slot.end_time.slice(0, 5), // HH:MM
						isBooked: slot.is_booked,
					}))
				setDaySlots(formattedSlots)
			} catch (error) {
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
		setSelectedSlots([])
		setStep(1)
	}

	const handleSlotSelect = (slot) => {
		const isAlreadySelected = selectedSlots.some(s => s.id === slot.id);

		if (isAlreadySelected) {
			// Убираем из выбранных
			setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id))
			setLocalError(null) // Очищаем ошибку
		} else {
			// Добавляем к выбранным
			setSelectedSlots([...selectedSlots, slot])
			setLocalError(null) // Очищаем ошибку
		}
	}

	const handleNextStep = () => {
		if (step === 1 && selectedSlots.length > 0) {
			setStep(2)
			setLocalError(null) // Очищаем ошибку при переходе на следующий шаг
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
		setLocalError(null) // Очищаем предыдущие ошибки

		if (selectedSlots.length === 0 || !clientName || !clientPhone) return

		try {
			setBookingLoading(true)

			// ОПТИМИЗАЦИЯ: Создаём все бронирования параллельно вместо последовательного цикла
			const bookingPromises = selectedSlots.map(slot =>
				createPublicBooking(
					slot.periodId,
					slot.date,
					slot.startTime,
					slot.endTime,
					clientName,
					clientPhone,
					clientEmail
				)
			)

			// Ждём завершения всех запросов
			const results = await Promise.all(bookingPromises)

			// Проверяем результаты
			const failedResult = results.find(result => !result.success)

			if (failedResult) {
				setLocalError(failedResult.error || 'Ошибка создания бронирования')
			} else {
				// Все бронирования успешны
				setStep(3)
				setLocalError(null) // Очищаем ошибку при успехе

				// Перезагружаем слоты асинхронно, чтобы показать обновлённые данные
				getOrCreateSlotsForDate(selectedCity, selectedDate)
					.then(slots => {
						const formattedSlots = slots
							.filter(slot => !slot.is_booked) // Показываем только доступные
							.map(slot => ({
								id: slot.id,
								periodId: slot.period_id,
								date: slot.slot_date,
								startTime: slot.start_time.slice(0, 5),
								endTime: slot.end_time.slice(0, 5),
								isBooked: slot.is_booked,
							}))
						setDaySlots(formattedSlots)
					})
					.catch(err => console.error('Error reloading slots:', err))
			}
		} catch (error) {
			const errorMsg = 'Ошибка создания бронирования'
			setLocalError(errorMsg)
		} finally {
			setBookingLoading(false)
		}
	}

	const handleReset = () => {
		setStep(1)
		setSelectedDate(null)
		setSelectedSlots([])
		setClientName('')
		setClientPhone('')
		setClientEmail('')
		setEmailError('')
		setPhoneError('')
		setLocalError(null) // Очищаем ошибку при сбросе
	}

	// Валидация полного формата телефона +7 999 999 99 99
	const validatePhoneNumber = (phone) => {
		// Удаляем все кроме цифр
		const cleaned = phone.replace(/\D/g, '')
		// Проверяем что есть 11 цифр и начинается с 7
		return cleaned.length === 11 && cleaned[0] === '7'
	}

	// Форматирование телефона +7 ### ### ## ##
	const formatPhoneNumber = (value) => {
		// Удаляем все кроме цифр
		const cleaned = value.replace(/\D/g, '')

		// Ограничиваем 11 цифрами (7 + 10 цифр)
		const limited = cleaned.slice(0, 11)

		// Форматируем
		if (limited.length === 0) return ''
		if (limited.length <= 1) return `+${limited}`
		if (limited.length <= 4) return `+${limited[0]} ${limited.slice(1)}`
		if (limited.length <= 7) return `+${limited[0]} ${limited.slice(1, 4)} ${limited.slice(4)}`
		if (limited.length <= 9) return `+${limited[0]} ${limited.slice(1, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`
		return `+${limited[0]} ${limited.slice(1, 4)} ${limited.slice(4, 7)} ${limited.slice(7, 9)} ${limited.slice(9)}`
	}

	const handlePhoneChange = (e) => {
		const formatted = formatPhoneNumber(e.target.value)
		setClientPhone(formatted)
		// Убираем ошибку при вводе, если пользователь исправляет
		if (phoneError && validatePhoneNumber(formatted)) {
			setPhoneError('')
		}
	}

	// Валидация телефона при потере фокуса
	const handlePhoneBlur = () => {
		if (clientPhone && !validatePhoneNumber(clientPhone)) {
			setPhoneError('Введите полный номер телефона в формате +7 999 999 99 99')
		}
	}

	// Валидация email
	const handleEmailChange = (e) => {
		const value = e.target.value
		setClientEmail(value)

		if (value && !value.includes('@')) {
			setEmailError('Email должен содержать символ @')
		} else {
			setEmailError('')
		}
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
		<div className="space-y-4 lg:space-y-5">
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
					<h3 className="text-xl lg:text-2xl font-light text-white mb-3">
						{selectedSlots.length === 1 ? 'Запись успешно создана!' : 'Записи успешно созданы!'}
					</h3>
					<p className="text-base text-slate-300 mb-2">
						{selectedSlots.length > 0 && new Date(selectedSlots[0].date + 'T00:00:00').toLocaleDateString('ru-RU', {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}
					</p>
					<div className="text-lg lg:text-xl text-ocean-300 mb-6">
						{selectedSlots.length === 1 ? (
							<p>{selectedSlots[0].startTime} - {selectedSlots[0].endTime}</p>
						) : (
							<div className="space-y-1">
								{selectedSlots.map((slot, idx) => (
									<p key={idx}>{slot.startTime} - {slot.endTime}</p>
								))}
							</div>
						)}
					</div>
					<button
						onClick={handleReset}
						className="px-6 py-3 rounded-lg bg-ocean-600 text-white font-medium text-base hover:bg-ocean-700 transition-colors"
					>
						Записаться ещё
					</button>
				</div>
			) : (
				<>
					<div className="mb-6 lg:mb-8">
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
										setSelectedSlots([])
										setStep(1)
									}}
									className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${selectedCity === city.id
										? 'bg-ocean-600 text-white'
										: 'bg-white/5 text-slate-300 hover:bg-white/10'
										}`}
								>
									{city.name}
								</button>
							))}
						</div>
					</div>

					{/* Двухколоночный layout: календарь слева, слоты/форма справа */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
						{/* ЛЕВАЯ КОЛОНКА: Календарь */}
						<div className="w-full">
							<div className="flex items-center justify-between mb-4">
								<button
									onClick={() => {
										const newMonth = new Date(currentMonth)
										newMonth.setMonth(newMonth.getMonth() - 1)
										setCurrentMonth(newMonth)
									}}
									className="p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<h3 className="text-base lg:text-lg font-medium text-white">
									{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
								</h3>
								<button
									onClick={() => {
										const newMonth = new Date(currentMonth)
										newMonth.setMonth(newMonth.getMonth() + 1)
										setCurrentMonth(newMonth)
									}}
									className="p-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>

							<div className="grid grid-cols-7 gap-1.5 mb-2">
								{dayNames.map(day => (
									<div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
										{day}
									</div>
								))}
							</div>

							<div className="grid grid-cols-7 gap-1.5">
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

						{/* ПРАВАЯ КОЛОНКА: Слоты и форма */}
						<div className="w-full">
							{!selectedDate ? (
								<div className="flex items-center justify-center h-full min-h-[300px] lg:min-h-[400px]">
									<div className="text-center">
										<svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<p className="text-slate-400 text-sm">Выберите дату в календаре</p>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									<div>
										<p className="text-sm text-slate-400">
											{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
												day: 'numeric',
												month: 'long',
												year: 'numeric'
											})}
										</p>
									</div>

									{step === 1 ? (
										loadingSlots ? (
											<div className="text-center py-8">
												<div className="inline-block w-6 h-6 border-4 border-ocean-300 border-t-transparent rounded-full animate-spin"></div>
											</div>
										) : daySlots.length === 0 ? (
											<p className="text-slate-400 text-center py-8 text-sm">Нет доступных слотов на эту дату</p>
										) : (
											<>
												<div className="grid grid-cols-2 gap-2">
													{daySlots.map((slot, idx) => {
														const isSelected = selectedSlots.some(s => s.id === slot.id)

														return (
															<button
																key={idx}
																type="button"
																onClick={() => handleSlotSelect(slot)}
																className={`
																px-3 py-2.5 rounded text-sm font-medium transition-all border relative
																${isSelected
																		? 'bg-ocean-600 text-white border-ocean-600'
																		: 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
																	}
															`}
															>
																{slot.startTime} - {slot.endTime}
																{isSelected && (
																	<span className="absolute -top-1 -right-1 w-5 h-5 bg-ocean-400 rounded-full flex items-center justify-center text-xs text-white">
																		{selectedSlots.findIndex(s => s.id === slot.id) + 1}
																	</span>
																)}
															</button>
														)
													})}
												</div>

												{selectedSlots.length > 0 && (
													<button
														type="button"
														onClick={handleNextStep}
														className="w-full mt-4 px-4 py-2.5 rounded-lg bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 transition-colors"
													>
														Продолжить ({selectedSlots.length} {selectedSlots.length === 1 ? 'слот' : selectedSlots.length < 6 ? 'слота' : 'слотов'})
													</button>
												)}
											</>
										)
									) : step === 2 ? (
										<div>
											<div className="mb-4 p-4 bg-ocean-500/20 rounded border border-ocean-500/30">
												<p className="text-sm text-slate-400 mb-1">
													{selectedSlots.length === 1 ? 'Выбранное время' : `Выбрано слотов: ${selectedSlots.length}`}
												</p>
												<div className="space-y-1">
													{selectedSlots.map((slot, idx) => (
														<p key={idx} className="text-base text-ocean-300 font-medium">
															{slot.startTime} - {slot.endTime}
														</p>
													))}
												</div>
											</div>

											<form onSubmit={handleSubmit} className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-slate-300 mb-2">
														ФИО <span className="text-red-400">*</span>
													</label>
													<input
														type="text"
														value={clientName}
														onChange={(e) => setClientName(e.target.value)}
														required
														className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
														placeholder="Ваше имя и фамилия"
													/>
												</div>

												<div>
													<label className="block text-sm font-medium text-slate-300 mb-2">
														Телефон <span className="text-red-400">*</span>
													</label>
													<input
														type="tel"
														value={clientPhone}
														onChange={handlePhoneChange}
														onBlur={handlePhoneBlur}
														required
														className={`w-full px-4 py-2.5 bg-white/5 border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent`}
														placeholder="+7 900 123 45 67"
													/>
													{phoneError && (
														<p className="text-xs text-red-400 mt-1">{phoneError}</p>
													)}
												</div>												<div>
													<label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
														Email
													</label>
													<input
														type="email"
														value={clientEmail}
														onChange={handleEmailChange}
														className={`w-full px-4 py-2.5 bg-white/5 border ${emailError ? 'border-red-500' : 'border-white/10'} rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent`}
														placeholder="your@email.com (опционально)"
													/>
													{emailError && (
														<p className="text-xs text-red-400 mt-1">{emailError}</p>
													)}
												</div>

												<div className="flex gap-2">
													<button
														type="button"
														onClick={handleBackStep}
														className="px-4 py-2.5 rounded bg-white/5 text-slate-300 font-medium text-sm hover:bg-white/10 transition-colors"
													>
														Назад
													</button>
													<button
														type="submit"
														disabled={bookingLoading || !clientName || !clientPhone || phoneError || emailError}
														className="flex-1 px-6 py-2.5 rounded bg-ocean-600 text-white font-medium text-sm hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{bookingLoading ? 'Создание записи...' : 'Записаться'}
													</button>
												</div>												{/* Локальное отображение ошибки над кнопкой */}
												{localError && (
													<div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
														<div className="flex items-start gap-2">
															<svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
															</svg>
															<p className="text-sm text-red-300">{localError}</p>
														</div>
													</div>
												)}
											</form>
										</div>
									) : null}
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default BookingWidget
