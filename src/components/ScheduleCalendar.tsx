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
	{ bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', solid: 'bg-blue-400' },
	{ bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', solid: 'bg-purple-400' },
	{ bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700', solid: 'bg-pink-400' },
	{ bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-700', solid: 'bg-rose-400' },
	{ bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', solid: 'bg-orange-400' },
	{ bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', solid: 'bg-amber-400' },
	{ bg: 'bg-lime-100', border: 'border-lime-400', text: 'text-lime-700', solid: 'bg-lime-400' },
	{ bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700', solid: 'bg-emerald-400' },
	{ bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700', solid: 'bg-teal-400' },
	{ bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-700', solid: 'bg-cyan-400' },
	{ bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700', solid: 'bg-indigo-400' },
	{ bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-700', solid: 'bg-violet-400' },
]

export default function ScheduleCalendar({
	slots,
	cities,
	selectedCityFilter,
	onCityFilterChange,
	onSlotClick,
	onPeriodEdit,
	onPeriodDelete,
}: ScheduleCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
	const [daysInfo, setDaysInfo] = useState<Record<string, DayInfo>>({})
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [expandedPeriodOnDate, setExpandedPeriodOnDate] = useState<string | null>(null)

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
		setSelectedDate(null)
		setExpandedPeriodOnDate(null)
	}

	const handleNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
		setSelectedDate(null)
		setExpandedPeriodOnDate(null)
	}

	const getDayCell = (dateStr: string) => {
		const dayInfo = daysInfo[dateStr]
		if (!dayInfo) return null

		const hasPeriods = dayInfo.periods.length > 0
		const isToday = dateStr === new Date().toISOString().split('T')[0]

		return (
			<div
				key={dateStr}
				className="min-h-[90px] p-2 transition-all cursor-pointer bg-white hover:bg-slate-50"
				onClick={() => setSelectedDate(dateStr)}
			>
				{/* День месяца */}
				<div className={`text-xs font-semibold mb-2 ${isToday
					? 'text-white bg-ocean-600 w-6 h-6 rounded-full flex items-center justify-center'
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

	const selectedDateInfo = selectedDate ? daysInfo[selectedDate] : null

	return (
		<div className="space-y-6">
			{/* Календарь */}
			<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
				{/* Заголовок с месяцем и навигацией */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
					<div className="flex items-center gap-3">
						<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<h3 className="text-lg font-bold text-slate-900">
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
				<div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
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
									<span className="text-xs font-medium text-slate-700">{city.name}</span>
								</button>
							)
						})}
					</div>
				</div>

				<div className="p-4">
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
									className="border-r border-b border-slate-200"
								>
									{dateStr ? getDayCell(dateStr) : <div className="min-h-[90px] bg-slate-50/30" />}
								</div>
							)
						})}
					</div>
				</div>
			</div>

			{/* Слоты для выбранной даты */}
			{selectedDateInfo && (
				<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
						<div className="flex items-center gap-3">
							<svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<div>
								<h3 className="text-sm font-medium text-slate-600">Расписание</h3>
								<p className="text-base font-bold text-slate-900">
									{new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
										weekday: 'long',
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</p>
							</div>
						</div>
						<button
							onClick={() => setSelectedDate(null)}
							className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
							title="Закрыть"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Периоды на выбранную дату */}
					<div className="p-6 space-y-4">
						{/* Кнопка добавления нового периода */}
						{selectedDateInfo.periods.length === 0 && (
							<div className="text-center py-8">
								<p className="text-slate-500 text-sm mb-4">На этот день нет рабочих периодов</p>
								<button
									onClick={() => {
										// Заполняем форму датой выбранного дня
										onPeriodEdit({
											id: 'new',
											city_id: '',
											start_date: selectedDate,
											end_date: selectedDate,
											work_start_time: '10:00:00',
											work_end_time: '18:00:00',
											city: null,
										} as any)
									}}
									className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium"
								>
									+ Добавить рабочий период
								</button>
							</div>
						)}

						{selectedDateInfo.periods.map((periodEntry) => {
							const cityColor = getCityColor(periodEntry.period.city_id)
							const isExpanded = expandedPeriodOnDate === periodEntry.period.id

							return (
								<div
									key={periodEntry.period.id}
									className="border border-slate-200 rounded-lg overflow-hidden"
								>
									{/* Заголовок периода */}
									<div className={`${cityColor.bg} px-4 py-3 border-b border-slate-200`}>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 flex-1">
												<div className={`w-3 h-3 rounded-sm ${cityColor.solid}`}></div>
												<div>
													<h4 className="text-base font-bold text-slate-900">
														{periodEntry.period.city?.name}
													</h4>
													<p className="text-sm text-slate-600">
														{periodEntry.period.work_start_time.slice(0, 5)} - {periodEntry.period.work_end_time.slice(0, 5)}
													</p>
												</div>
											</div>

											{/* Кнопки действий */}
											<div className="flex items-center gap-1">
												<button
													onClick={() => onPeriodEdit(periodEntry.period)}
													className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
													title="Редактировать период"
												>
													<svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => onPeriodDelete(periodEntry.period.id)}
													className="p-2 rounded-lg hover:bg-red-50 transition-colors"
													title="Удалить период"
												>
													<svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
												<button
													onClick={() =>
														setExpandedPeriodOnDate(
															isExpanded ? null : periodEntry.period.id
														)
													}
													className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
													title={isExpanded ? 'Свернуть' : 'Развернуть слоты'}
												>
													<svg
														className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
													</svg>
												</button>
											</div>
										</div>
									</div>

									{/* Слоты */}
									{isExpanded && (
										<div className="p-4 bg-white">
											<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
												{periodEntry.slots.map((slot) => (
													<button
														key={slot.id}
														onClick={() => onSlotClick(slot)}
														className={`px-3 py-2 rounded-lg text-center transition-colors ${slot.is_booked
															? 'bg-slate-100 text-slate-400 cursor-not-allowed'
															: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100 border border-ocean-200'
															}`}
														disabled={slot.is_booked}
														title={slot.is_booked ? 'Забронировано' : 'Свободно'}
													>
														<div className="text-sm font-semibold">
															{slot.start_time.slice(0, 5)}
														</div>
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
