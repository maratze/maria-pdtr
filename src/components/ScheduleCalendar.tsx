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
	onSlotClick,
	onPeriodEdit,
	onPeriodDelete,
	onDeleteMultiplePeriods,
	onCreatePeriodForRange,
}: ScheduleCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
	const [daysInfo, setDaysInfo] = useState<Record<string, DayInfo>>({})
	const [dateRangeStart, setDateRangeStart] = useState<string | null>(null)
	const [dateRangeEnd, setDateRangeEnd] = useState<string | null>(null)

	// Получаем цвет для города
	const getCityColor = (cityId: string) => {
		const index = cities.findIndex(c => c.id === cityId)
		return cityColors[index % cityColors.length]
	}

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
		} else if (dateRangeStart === dateStr) {
			// Клик на ту же дату - отмена
			setDateRangeStart(null)
			setDateRangeEnd(null)
		} else if (!dateRangeEnd) {
			// Второй клик - устанавливаем конец (с сортировкой)
			if (dateStr < dateRangeStart) {
				setDateRangeEnd(dateRangeStart)
				setDateRangeStart(dateStr)
			} else {
				setDateRangeEnd(dateStr)
			}
		} else {
			// Уже есть диапазон - новый выбор
			setDateRangeStart(dateStr)
			setDateRangeEnd(null)
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
		const rangePosition = isDateInRange(dateStr)
		const isRangeEnd = rangePosition === 'end'

		return (
			<div
				key={dateStr}
				className={`min-h-[100px] p-2 transition-all cursor-pointer relative ${rangePosition ? 'bg-ocean-100' : 'bg-white hover:bg-slate-50'
					}`}
				onClick={() => handleDateRangeClick(dateStr)}
			>
				{/* Кнопки действий для выбранного диапазона (плавающие в правом верхнем углу) */}
				{rangePosition && dateRangeStart && (isRangeEnd || !dateRangeEnd) && (
					<div className="absolute top-1 right-1 flex items-center gap-1 z-10">
						{onCreatePeriodForRange && (
							<button
								onClick={(e) => {
									e.stopPropagation()
									onCreatePeriodForRange(dateRangeStart, dateRangeEnd || dateRangeStart)
								}}
								className="p-1.5 rounded-lg bg-white text-ocean-600 hover:bg-ocean-50 transition-all shadow-md hover:shadow-lg border border-ocean-200"
								title="Добавить период"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
								</svg>
							</button>
						)}
						<button
							onClick={(e) => {
								e.stopPropagation()
								const rangeEnd = dateRangeEnd || dateRangeStart
								const periodsToDelete = periods.filter((period: SchedulePeriodWithCity) => {
									const periodStart = period.start_date
									const periodEnd = period.end_date
									const isOverlapping = !(periodEnd < dateRangeStart || periodStart > rangeEnd)
									return isOverlapping
								})

								if (periodsToDelete.length > 0 && onDeleteMultiplePeriods) {
									const idsToDelete = periodsToDelete.map(p => p.id)
									onDeleteMultiplePeriods(idsToDelete)
								}
								setDateRangeStart(null)
								setDateRangeEnd(null)
							}}
							className="p-1.5 rounded-lg bg-white text-red-600 hover:bg-red-50 transition-all shadow-md hover:shadow-lg border border-red-200"
							title="Удалить периоды"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				)}

				{/* День месяца */}
				<div className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center mb-2 ${rangePosition === 'start' || rangePosition === 'end'
					? 'text-white bg-ocean-600'
					: isToday
						? 'text-white bg-ocean-600'
						: 'text-slate-700'
					}`}>
					{dayInfo.dayOfMonth}
				</div>

				{/* Периоды на этот день */}
				{hasPeriods && (
					<div className="space-y-1">
						{dayInfo.periods.map((period) => {
							const cityColor = getCityColor(period.city_id)
							return (
								<div
									key={period.id}
									className={`px-1.5 py-1 rounded ${cityColor.bg} ${cityColor.text}`}
									title={`${period.city?.name}: ${period.work_start_time.slice(0, 5)} - ${period.work_end_time.slice(0, 5)}`}
								>
									<div className="text-[12px] font-medium leading-tight">{period.city?.name}</div>
									<div className="text-[12px] leading-tight">{`${period.work_start_time.slice(0, 5)} - ${period.work_end_time.slice(0, 5)}`}</div>
								</div>
							)
						})}
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
				{/* Заголовок с месяцем и навигацией */}
				<div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
					<div className="flex items-center gap-3 flex-1">
						<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<h3 className="text-lg font-medium text-slate-800">
							{monthNames[month]} {year}
						</h3>
					</div>

					{/* Навигация по месяцам */}
					<div className="flex items-center gap-1">
						<button
							onClick={handlePrevMonth}
							className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
							title="Предыдущий месяц"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							onClick={handleNextMonth}
							className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
							title="Следующий месяц"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>				{/* Легенда городов */}
				<div className="p-3 bg-slate-50 border-b border-slate-200">
					<div className="flex items-center gap-4 flex-wrap">
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
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isSelected
										? `${cityColor.bg} border-2 ${cityColor.border} font-semibold`
										: 'hover:bg-slate-100 border-2 border-transparent'
										}`}
								>
									<div className={`w-3 h-3 rounded-sm ${cityColor.solid}`}></div>
									<span className="text-sm font-medium text-slate-700">{city.name}</span>
								</button>
							)
						})}
					</div>
				</div>

				<div className="p-3">
					{/* Дни недели */}
					<div className="grid grid-cols-7 mb-2">
						{dayNames.map((day) => (
							<div
								key={day}
								className="text-center text-xs font-bold text-slate-600 py-2 uppercase tracking-wide"
							>
								{day}
							</div>
						))}
					</div>

					{/* Сетка дней */}
					<div className="grid grid-cols-7 rounded-lg overflow-hidden border-t border-l border-slate-200">
						{calendarDays.map((dateStr, idx) => {
							return (
								<div
									key={idx}
									className={`border-r border-b border-slate-200 ${dateStr ? getDayCell(dateStr) : 'min-h-[90px] bg-slate-100/50 rounded-none'}`}
								>
									{dateStr ? getDayCell(dateStr) : <div className="min-h-[100px] rounded-none" />}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
