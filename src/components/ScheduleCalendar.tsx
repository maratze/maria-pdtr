import { useState, useEffect } from 'react'
import type { SchedulePeriodWithCity, City } from '../types/booking'
import { generateSlotsForDateAndCity, type GeneratedSlot, type OptimizedBooking } from '../lib/slots'

interface ScheduleCalendarProps {
	periods: SchedulePeriodWithCity[]
	bookings: OptimizedBooking[]
	cities: City[]
	selectedCityFilter: string
	onCityFilterChange: (cityId: string) => void
	onSlotClick?: (slot: GeneratedSlot) => void
	onPeriodEdit?: (period: SchedulePeriodWithCity) => void
	onPeriodDelete?: (id: string) => void
	onDeleteMultiplePeriods?: (ids: string[]) => void | Promise<void>
	onCreatePeriodForRange?: (startDate: string, endDate: string) => void
}

interface DayInfo {
	date: string
	dayOfMonth: number
	periods: SchedulePeriodWithCity[]
	totalSlots: number
	bookedSlots: number
	freeSlots: number
}

// Палитра пастельных цветов для городов
const cityColors = [
	{ bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-600', solid: 'bg-rose-400' },
	{ bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-600', solid: 'bg-pink-400' },
	{ bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-600', solid: 'bg-purple-400' },
	{ bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-600', solid: 'bg-blue-400' },
	{ bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-600', solid: 'bg-orange-400' },
	{ bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-600', solid: 'bg-amber-400' },
	{ bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-600', solid: 'bg-lime-400' },
	{ bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-600', solid: 'bg-emerald-400' },
	{ bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-600', solid: 'bg-teal-400' },
	{ bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-600', solid: 'bg-cyan-400' },
	{ bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-600', solid: 'bg-indigo-400' },
	{ bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-600', solid: 'bg-violet-400' },
]

export default function ScheduleCalendar({
	periods,
	bookings,
	cities,
	selectedCityFilter,
	onCityFilterChange,
	onPeriodEdit,
	onDeleteMultiplePeriods,
	onCreatePeriodForRange,
}: ScheduleCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
	const [daysInfo, setDaysInfo] = useState<Record<string, DayInfo>>({})
	const [dateRangeStart, setDateRangeStart] = useState<string | null>(null)
	const [dateRangeEnd, setDateRangeEnd] = useState<string | null>(null)
	const [selectedPeriodsForEdit, setSelectedPeriodsForEdit] = useState<SchedulePeriodWithCity[]>([])
	const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' && window.innerWidth < 640)

	// Получаем цвет для города
	const getCityColor = (cityId: string) => {
		const index = cities.findIndex(c => c.id === cityId)
		return cityColors[index % cityColors.length]
	}

	// Очищаем выделение когда периоды обновляются (новые периоды добавлены)
	useEffect(() => {
		if (dateRangeStart && dateRangeEnd) {
			// Проверяем, изменилось ли количество периодов
			setDateRangeStart(null)
			setDateRangeEnd(null)
			setSelectedPeriodsForEdit([])
		}
	}, [periods])

	// Отслеживаем размер экрана
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 640)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Генерируем информацию о днях на основе периодов и бронирований
	useEffect(() => {
		const dayMap: Record<string, DayInfo> = {}

		// Генерируем все дни в текущем месяце
		const year = currentMonth.getFullYear()
		const month = currentMonth.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		for (let i = 1; i <= daysInMonth; i++) {
			const year_str = String(year).padStart(4, '0')
			const month_str = String(month + 1).padStart(2, '0')
			const day_str = String(i).padStart(2, '0')
			const dateStr = `${year_str}-${month_str}-${day_str}`

			// Находим периоды для этой даты
			const dayPeriods = periods.filter(period => {
				const periodStart = period.start_date
				const periodEnd = period.end_date
				return dateStr >= periodStart && dateStr <= periodEnd
			})

			// Генерируем слоты для этой даты и считаем статистику
			const daySlots = generateSlotsForDateAndCity(periods, bookings, dateStr, selectedCityFilter)
			const bookedSlots = daySlots.filter(slot => slot.isBooked).length

			dayMap[dateStr] = {
				date: dateStr,
				dayOfMonth: i,
				periods: dayPeriods,
				totalSlots: daySlots.length,
				bookedSlots: bookedSlots,
				freeSlots: daySlots.length - bookedSlots,
			}
		}

		setDaysInfo(dayMap)
	}, [periods, bookings, currentMonth, selectedCityFilter])

	const handlePrevMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
	}

	const handleNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
	}

	const handleDateRangeClick = (dateStr: string) => {
		if (!dateRangeStart) {
			// Первый клик - устанавливаем начало
			setDateRangeStart(dateStr)

			// Находим периоды на этот день
			const dayPeriods = periods.filter((period) => {
				const periodStart = period.start_date
				const periodEnd = period.end_date
				return dateStr >= periodStart && dateStr <= periodEnd
			})
			setSelectedPeriodsForEdit(dayPeriods)
		} else if (dateRangeStart === dateStr) {
			// Клик на ту же дату - отмена
			setDateRangeStart(null)
			setDateRangeEnd(null)
			setSelectedPeriodsForEdit([])
		} else if (!dateRangeEnd) {
			// Второй клик - устанавливаем конец (с сортировкой)
			let start = dateRangeStart
			let end = dateStr
			if (dateStr < dateRangeStart) {
				start = dateStr
				end = dateRangeStart
			}
			setDateRangeStart(start)
			setDateRangeEnd(end)

			// Находим все периоды, которые пересекаются с выбранным диапазоном
			const overlappingPeriods = periods.filter((period) => {
				const periodStart = period.start_date
				const periodEnd = period.end_date
				const isOverlapping = !(periodEnd < start || periodStart > end)
				return isOverlapping
			})
			setSelectedPeriodsForEdit(overlappingPeriods)
		} else {
			// Уже есть диапазон - новый выбор
			setDateRangeStart(dateStr)
			setDateRangeEnd(null)

			// Находим периоды на этот день
			const dayPeriods = periods.filter((period) => {
				const periodStart = period.start_date
				const periodEnd = period.end_date
				return dateStr >= periodStart && dateStr <= periodEnd
			})
			setSelectedPeriodsForEdit(dayPeriods)
		}
	}

	const isDateInRange = (dateStr: string): 'start' | 'middle' | 'end' | null => {
		if (!dateRangeStart) return null
		if (!dateRangeEnd) {
			return dateStr === dateRangeStart ? 'start' : null
		}
		if (dateStr === dateRangeStart) return 'start'
		if (dateStr === dateRangeEnd) return 'end'
		if (dateStr > dateRangeStart && dateStr < dateRangeEnd) return 'middle'
		return null
	}

	const getDayCell = (dateStr: string) => {
		const dayInfo = daysInfo[dateStr]
		if (!dayInfo) return null

		const hasPeriods = dayInfo.periods.length > 0
		// Получаем сегодняшнюю дату в локальном формате
		const today = new Date()
		const todayStr = `${String(today.getFullYear()).padStart(4, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
		const isToday = dateStr === todayStr
		// Проверяем, является ли день прошедшим
		const isPastDate = new Date(dateStr + 'T00:00:00') < new Date(todayStr + 'T00:00:00')
		const rangePosition = isDateInRange(dateStr)

		return (
			<div
				key={dateStr}
				className={`min-h-[80px] sm:min-h-[100px] md:min-h-[100px] p-1 sm:p-2 md:p-2 transition-all relative flex flex-col h-full w-full ${isPastDate
					? 'bg-slate-50 cursor-not-allowed opacity-60'
					: rangePosition
						? 'bg-ocean-100 cursor-pointer'
						: 'bg-white hover:bg-slate-50 cursor-pointer'
					}`}
				onClick={() => !isPastDate && handleDateRangeClick(dateStr)}
			>
				{/* День месяца */}
				<div className={`text-xs sm:text-sm font-semibold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mb-1 sm:mb-2 flex-shrink-0 ${rangePosition === 'start' || rangePosition === 'end'
					? 'text-white bg-ocean-600'
					: isToday
						? 'text-white bg-ocean-600'
						: 'text-slate-700'
					}`}>
					{dayInfo.dayOfMonth}
				</div>

				{/* Статус бронирований - скрыто на мобильных, показано на планшетах */}
				{hasPeriods && (dayInfo.bookedSlots > 0 || dayInfo.freeSlots > 0) && (
					<div className="hidden sm:flex mb-1 sm:mb-2 text-xs gap-1 sm:gap-2 flex-shrink-0">
						{dayInfo.bookedSlots > 0 && (
							<div className="flex items-center gap-0.5">
								<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
								<span className="text-red-600 font-medium text-xs">{dayInfo.bookedSlots}</span>
							</div>
						)}
						{dayInfo.freeSlots > 0 && (
							<div className="flex items-center gap-0.5">
								<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
								<span className="text-green-600 font-medium text-xs">{dayInfo.freeSlots}</span>
							</div>
						)}
					</div>
				)}

				{/* Периоды на этот день - показываем максимум 2 на мобильных */}
				{hasPeriods && (
					<div className="space-y-0.5 sm:space-y-1 overflow-hidden flex-grow">
						{dayInfo.periods.slice(0, isMobile ? 2 : undefined).map((period) => {
							const cityColor = getCityColor(period.city_id)
							return (
								<div
									key={period.id}
									onClick={(e) => {
										e.stopPropagation()
										if (onPeriodEdit) {
											onPeriodEdit(period)
										}
									}}
									className={`px-1 py-0.5 sm:px-1.5 sm:py-1 rounded ${cityColor.bg} ${cityColor.text} cursor-pointer hover:opacity-80 transition-opacity`}
									title={`${period.city?.name}: ${period.work_start_time.slice(0, 5)} - ${period.work_end_time.slice(0, 5)}`}
								>
									<div className="text-[10px] sm:text-[12px] font-medium leading-tight truncate">{period.city?.name}</div>
									<div className="text-[10px] sm:text-[12px] leading-tight">{`${period.work_start_time.slice(0, 5)} - ${period.work_end_time.slice(0, 5)}`}</div>
								</div>
							)
						})}
						{isMobile && dayInfo.periods.length > 2 && (
							<div className="text-[10px] text-slate-500 px-1 font-medium flex-shrink-0">
								+{dayInfo.periods.length - 2} ещё
							</div>
						)}
					</div>
				)}
			</div>
		)
	}

	const year = currentMonth.getFullYear()
	const month = currentMonth.getMonth()
	const firstDay = new Date(year, month, 1).getDay()
	const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1 // Понедельник = 0
	const daysInMonth = new Date(year, month + 1, 0).getDate()

	// Создаем сетку с пустыми ячейками в начале месяца
	const calendarDays: (string | null)[] = []
	for (let i = 0; i < adjustedFirstDay; i++) {
		calendarDays.push(null)
	}
	for (let i = 1; i <= daysInMonth; i++) {
		// Используем локальную дату без конвертации в UTC
		const year_str = String(year).padStart(4, '0')
		const month_str = String(month + 1).padStart(2, '0')
		const day_str = String(i).padStart(2, '0')
		const dateStr = `${year_str}-${month_str}-${day_str}`
		calendarDays.push(dateStr)
	}

	// Добавляем пустые ячейки в конец месяца для полной сетки
	const remainingCells = (7 - (calendarDays.length % 7)) % 7
	for (let i = 0; i < remainingCells; i++) {
		calendarDays.push(null)
	}

	const monthNames = [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь',
	]

	const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

	return (
		<div className="space-y-6">
			{/* Календарь */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
				{/* Легенда городов - на самый верх */}
				<div className="p-2 sm:p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
					<div className="flex items-center gap-1 sm:gap-2 flex-wrap min-w-fit">
						{cities.map((city, index) => {
							const cityColor = cityColors[index % cityColors.length]
							const isSelected = selectedCityFilter === city.id
							return (
								<button
									key={city.id}
									onClick={() => {
										// Переключаем фильтр: если выбран - отключаем, иначе включаем
										onCityFilterChange(isSelected ? '' : city.id)
									}}
									className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${isSelected
										? `${cityColor.bg} border-2 ${cityColor.border} font-semibold`
										: 'hover:bg-slate-100 border-2 border-transparent'
										}`}
								>
									<div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm flex-shrink-0 ${cityColor.solid}`}></div>
									<span className="font-medium text-slate-700">{city.name}</span>
								</button>
							)
						})}
					</div>
				</div>

				<div className="p-2 sm:p-3">
					{/* Панель действий и информации - объединённая с кнопками месяца */}
					<div className="mb-4 p-2 sm:p-3 bg-slate-50 border border-slate-200 rounded-lg min-h-16 sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
						{/* Левая часть - месяц и навигация */}
						<div className="flex gap-1 sm:gap-2 items-center w-full sm:w-auto">
							<button
								onClick={handlePrevMonth}
								className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
								title="Предыдущий месяц"
							>
								<svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button
								onClick={handleNextMonth}
								className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
								title="Следующий месяц"
							>
								<svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>

							<h3 className="text-sm sm:text-lg font-medium text-slate-800 whitespace-nowrap">
								{monthNames[month]} {year}
							</h3>
						</div>

						{/* Правая часть - кнопки действий */}
						{dateRangeStart && (
							<>
								<div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
									<div className="flex justify-center flex-grow sm:flex-grow-0">
										{dateRangeStart ? (
											dateRangeEnd ? (
												<div className="flex items-center gap-1 sm:gap-2">
													<svg className="w-4 h-4 sm:w-5 sm:h-5 text-ocean-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													<div className="flex flex-col">
														<span className="text-xs sm:text-sm font-medium text-slate-700 leading-tight">
															{new Date(dateRangeStart + 'T00:00:00').toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} - {new Date(dateRangeEnd + 'T00:00:00').toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
															{(() => {
																const start = new Date(dateRangeStart + 'T00:00:00')
																const end = new Date(dateRangeEnd + 'T00:00:00')
																const daysCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
																return ` (${daysCount}д)`
															})()}
														</span>
													</div>
												</div>
											) : (
												<div className="flex items-center gap-1 sm:gap-2">
													<svg className="w-4 h-4 sm:w-5 sm:h-5 text-ocean-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													<div className="flex flex-col">
														<span className="text-xs sm:text-sm font-medium text-slate-700 leading-tight">
															{new Date(dateRangeStart + 'T00:00:00').toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
														</span>
													</div>
												</div>
											)
										) : (
											<div className="flex items-center gap-1 sm:gap-2 text-slate-600">
												<svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<span className="text-xs sm:text-sm">Выберите диапазон</span>
											</div>
										)}
									</div>

									{onCreatePeriodForRange && (
										<button
											onClick={() => onCreatePeriodForRange(dateRangeStart, dateRangeEnd || dateRangeStart)}
											className="p-1.5 sm:p-2 rounded-lg bg-white text-green-600 hover:bg-green-50 transition-all border border-green-200 flex-shrink-0"
											title="Добавить период на выбранный диапазон"
										>
											<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
											</svg>
										</button>
									)}
									{selectedPeriodsForEdit.length > 0 && (
										<button
											onClick={() => {
												let idsToDelete: string[] = []

												if (dateRangeEnd) {
													// Если выбран диапазон - удаляем все периоды в диапазоне
													const periodsToDelete = periods.filter((period: SchedulePeriodWithCity) => {
														const periodStart = period.start_date
														const periodEnd = period.end_date
														const isOverlapping = !(periodEnd < dateRangeStart || periodStart > dateRangeEnd)
														return isOverlapping
													})
													idsToDelete = periodsToDelete.map(p => p.id)
												} else {
													// Если выбрана одна дата - удаляем только периоды на эту дату
													idsToDelete = selectedPeriodsForEdit.map(p => p.id)
												}

												if (idsToDelete.length > 0 && onDeleteMultiplePeriods) {
													onDeleteMultiplePeriods(idsToDelete)
												}
												setDateRangeStart(null)
												setDateRangeEnd(null)
												setSelectedPeriodsForEdit([])
											}}
											className="p-1.5 sm:p-2 rounded-lg bg-white text-red-600 hover:bg-red-50 transition-all border border-red-200 flex-shrink-0"
											title="Удалить периоды"
										>
											<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									)}
									<button
										onClick={() => {
											setDateRangeStart(null)
											setDateRangeEnd(null)
											setSelectedPeriodsForEdit([])
										}}
										className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all text-xs sm:text-sm font-medium flex-shrink-0"
										title="Отменить выбор"
									>
										Отмена
									</button>
								</div>
							</>
						)}
					</div>

					{/* Дни недели */}
					<div className="grid grid-cols-7 mb-1 sm:mb-2">
						{dayNames.map((day) => (
							<div
								key={day}
								className="text-center text-[10px] sm:text-xs font-bold text-slate-600 py-1 sm:py-2 uppercase tracking-wide"
							>
								{day}
							</div>
						))}
					</div>

					{/* Сетка дней */}
					<div className="grid grid-cols-7 rounded-lg overflow-hidden border-t border-l border-slate-200 gap-0">
						{calendarDays.map((dateStr, idx) => {
							return (
								<div
									key={idx}
									className={`border-r border-b border-slate-200 ${!dateStr ? 'min-h-[60px] sm:min-h-[90px] bg-slate-100/50 rounded-none' : ''}`}
								>
									{dateStr ? getDayCell(dateStr) : <div className="min-h-[60px] sm:min-h-[100px] rounded-none" />}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
