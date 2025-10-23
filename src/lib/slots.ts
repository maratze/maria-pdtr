import type { SchedulePeriodWithCity } from '../types/booking'

// Оптимизированная структура бронирования без промежуточных слотов
export interface OptimizedBooking {
	id: string
	period_id: string
	booking_date: string // YYYY-MM-DD
	start_time: string // HH:MM
	end_time: string // HH:MM
	service_id: string | null
	client_name: string
	client_phone: string
	client_email: string
	status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
	notes: string | null
	created_at?: string
	updated_at?: string
}

export interface GeneratedSlot {
	id: string // уникальный ID для React keys
	periodId: string
	date: string // YYYY-MM-DD
	startTime: string // HH:MM
	endTime: string // HH:MM
	isBooked: boolean
	booking?: OptimizedBooking // если слот забронирован
}

/**
 * Генерирует слоты времени для периода на основе времени работы
 * @param period - период расписания
 * @param bookings - существующие бронирования для фильтрации
 * @param slotDurationMinutes - длительность слота в минутах (по умолчанию 60)
 */
export function generateSlotsForPeriod(
	period: SchedulePeriodWithCity,
	bookings: OptimizedBooking[] = [],
	slotDurationMinutes: number = 60
): GeneratedSlot[] {
	const slots: GeneratedSlot[] = []

	// Итерируемся по каждой дате в периоде
	const startDate = new Date(period.start_date + 'T00:00:00')
	const endDate = new Date(period.end_date + 'T00:00:00')
	const currentDate = new Date(startDate)

	while (currentDate <= endDate) {
		const dateStr = currentDate.toISOString().split('T')[0] // YYYY-MM-DD

		// Генерируем слоты для этой даты
		const dailySlots = generateSlotsForDate(
			period.id,
			dateStr,
			period.work_start_time,
			period.work_end_time,
			bookings,
			slotDurationMinutes
		)

		slots.push(...dailySlots)
		currentDate.setDate(currentDate.getDate() + 1)
	}

	return slots
}

/**
 * Генерирует слоты для конкретной даты
 */
function generateSlotsForDate(
	periodId: string,
	date: string,
	workStartTime: string,
	workEndTime: string,
	bookings: OptimizedBooking[],
	slotDurationMinutes: number
): GeneratedSlot[] {
	const slots: GeneratedSlot[] = []

	// Парсим время начала и конца работы
	const startTime = parseTime(workStartTime)
	const endTime = parseTime(workEndTime)

	// Генерируем слоты с интервалом
	let currentTime = startTime
	let slotIndex = 0

	while (currentTime + slotDurationMinutes <= endTime) {
		const slotStart = formatTime(currentTime)
		const slotEnd = formatTime(currentTime + slotDurationMinutes)

		// Проверяем, есть ли бронирование на этот слот
		const booking = findBookingForSlot(bookings, periodId, date, slotStart, slotEnd)

		slots.push({
			id: `${periodId}-${date}-${slotIndex}`, // уникальный ID
			periodId,
			date,
			startTime: slotStart,
			endTime: slotEnd,
			isBooked: !!booking,
			booking: booking || undefined
		})

		currentTime += slotDurationMinutes
		slotIndex++
	}

	return slots
}

/**
 * Находит бронирование для конкретного слота времени
 */
function findBookingForSlot(
	bookings: OptimizedBooking[],
	periodId: string,
	date: string,
	startTime: string,
	endTime: string
): OptimizedBooking | null {
	return bookings.find(booking =>
		booking.period_id === periodId &&
		booking.booking_date === date &&
		booking.start_time === startTime &&
		booking.end_time === endTime
	) || null
}

/**
 * Парсит время в формате HH:MM в минуты от начала дня
 */
function parseTime(timeString: string): number {
	const [hours, minutes] = timeString.split(':').map(Number)
	return hours * 60 + minutes
}

/**
 * Форматирует минуты от начала дня в HH:MM
 */
function formatTime(minutes: number): string {
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Генерирует слоты для конкретной даты и города (для календаря)
 */
export function generateSlotsForDateAndCity(
	periods: SchedulePeriodWithCity[],
	bookings: OptimizedBooking[],
	date: string,
	cityId?: string
): GeneratedSlot[] {
	const filteredPeriods = periods.filter(period => {
		const periodStart = period.start_date
		const periodEnd = period.end_date
		const matchesDate = date >= periodStart && date <= periodEnd
		const matchesCity = !cityId || period.city_id === cityId
		return matchesDate && matchesCity
	})

	const allSlots: GeneratedSlot[] = []

	for (const period of filteredPeriods) {
		const periodSlots = generateSlotsForDate(
			period.id,
			date,
			period.work_start_time,
			period.work_end_time,
			bookings,
			60 // 1 час по умолчанию
		)
		allSlots.push(...periodSlots)
	}

	return allSlots
}