import { useState, useEffect } from 'react'
import type { TimeSlot, SchedulePeriodWithCity, City } from '../types/booking'

interface ScheduleCalendarProps {
	slots: (TimeSlot & { period: SchedulePeriodWithCity })[]
	periods: SchedulePeriodWithCity[]
	cities: City[]
	selectedCityFilter: string
	onCityFilterChange: (cityId: string) => void
	onSlotClick: (slot: TimeSlot) => void
	onPeriodEdit: (period: SchedulePeriodWithCity) => void
	onPeriodDelete: (id: string) => void
	onCreatePeriodForRange?: (startDate: string, endDate: string) => void
}

interface DayInfo {
	date: string
	dayOfMonth: number
	periods: {
		period: SchedulePeriodWithCity
		slotCount: number
		bookedCount: number
		freeCount: number
		slots: TimeSlot[]
	}[]
}

// Палитра пастельных цветов для городов
const cityColors = [
	{ bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-600', solid: 'bg-blue-400' },
	{ bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-600', solid: 'bg-purple-400' },
	{ bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-600', solid: 'bg-pink-400' },
	{ bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-600', solid: 'bg-rose-400' },
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
	slots,
	cities,
	selectedCityFilter,
	onCityFilterChange,
	onSlotClick,
	onPeriodEdit,
	onPeriodDelete,
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

	// Группируем слоты по датам и периодам
	useEffect(() => {
		const dayMap: Record<string, DayInfo> = {}

		// Генерируем все дни в текущем месяце
		const year = currentMonth.getFullYear()
		const month = currentMonth.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()

		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(year, month, i)
			const dateStr = date.toISOString().split('T')[0]
			dayMap[dateStr] = {
				date: dateStr,
				dayOfMonth: i,
				periods: [],
			}
		}

		// Заполняем данные из слотов
		slots.forEach((slotWithPeriod) => {
			const dateStr = slotWithPeriod.slot_date
			if (dayMap[dateStr]) {
				// Находим или создаем запись для периода в этом дне
				let periodEntry = dayMap[dateStr].periods.find(
					p => p.period.id === slotWithPeriod.period.id
				)

				if (!periodEntry) {
					periodEntry = {
						period: slotWithPeriod.period,
						slotCount: 0,
						bookedCount: 0,
						freeCount: 0,
						slots: [],
					}
					dayMap[dateStr].periods.push(periodEntry)
				}

				periodEntry.slots.push(slotWithPeriod)
				periodEntry.slotCount++
				if (slotWithPeriod.is_booked) {
					periodEntry.bookedCount++
				} else {
					periodEntry.freeCount++
				}
			}
		})

		setDaysInfo(dayMap)
	}, [slots, currentMonth])

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
		const isToday = dateStr === new Date().toISOString().split('T')[0]
		const rangePosition = isDateInRange(dateStr)

		return (
			<div
				key={dateStr}
				className={`min-h-[100px] p-2 transition-all cursor-pointer ${rangePosition ? 'bg-ocean-100' : 'bg-white hover:bg-slate-50'
					}`}
				onClick={() => handleDateRangeClick(dateStr)}
			>
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
						{dayInfo.periods.map((periodEntry) => {
							const cityColor = getCityColor(periodEntry.period.city_id)
							return (
								<div
									key={periodEntry.period.id}
									className={`px-1.5 py-1 rounded ${cityColor.bg} ${cityColor.text}`}
									title={`${periodEntry.period.city?.name}: ${periodEntry.period.work_start_time.slice(0, 5)} - ${periodEntry.period.work_end_time.slice(0, 5)}`}
								>
									<div className="text-[12px] font-medium leading-tight">{periodEntry.period.city?.name}</div>
									<div className="text-[12px] leading-tight">{`${periodEntry.period.work_start_time.slice(0, 5)} - ${periodEntry.period.work_end_time.slice(0, 5)}`}</div>
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
		const date = new Date(year, month, i)
		calendarDays.push(date.toISOString().split('T')[0])
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
					<div className="flex items-center gap-3">
						<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<h3 className="text-lg font-medium text-slate-800">
							{monthNames[month]} {year}
						</h3>
					</div>
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
				</div>

				{/* Легенда городов */}
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

				{/* Блок выбранного диапазона дат */}
				{dateRangeStart && dateRangeEnd && (
					<div className="px-6 py-4 bg-ocean-50 border-t border-slate-200">
						<div className="flex items-center justify-between gap-4">
							<div className="text-sm">
								<span className="font-medium text-slate-700">Выбрано: </span>
								<span className="font-semibold text-ocean-700">
									{new Date(dateRangeStart + 'T00:00:00').toLocaleDateString('ru-RU', {
										day: 'numeric',
										month: 'long',
									})} - {new Date(dateRangeEnd + 'T00:00:00').toLocaleDateString('ru-RU', {
										day: 'numeric',
										month: 'long',
									})}
									{' '}({Math.floor((new Date(dateRangeEnd).getTime() - new Date(dateRangeStart).getTime()) / (1000 * 60 * 60 * 24)) + 1} дней)
								</span>
							</div>
							<div className="flex items-center gap-2">
								{onCreatePeriodForRange && (
									<button
										onClick={() => onCreatePeriodForRange(dateRangeStart, dateRangeEnd)}
										className="px-4 py-1.5 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium"
									>
										+ Добавить период
									</button>
								)}
								<button
									onClick={() => {
										setDateRangeStart(null)
										setDateRangeEnd(null)
									}}
									className="px-3 py-1.5 bg-white text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium"
								>
									Отмена
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
