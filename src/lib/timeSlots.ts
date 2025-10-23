import { supabase, supabaseAdmin } from './supabaseClient';
import type {
	TimeSlot,
	TimeSlotWithPeriod,
	AvailableDate,
	SlotForBooking,
} from '../types/booking';

/**
 * Получить все слоты для периода расписания (админ)
 */
export async function getTimeSlotsByPeriod(
	periodId: string
): Promise<TimeSlotWithPeriod[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('time_slots')
		.select(`
      *,
      schedule_period:schedule_periods(
        *,
        city:cities(*)
      )
    `)
		.eq('period_id', periodId)
		.order('slot_date')
		.order('slot_time');

	if (error) {
		console.error('Error fetching time slots by period:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить доступные слоты для бронирования по городу (публичный метод)
 * Возвращает только свободные слоты в будущем
 */
export async function getAvailableSlotsByCity(
	cityId: string
): Promise<SlotForBooking[]> {
	const today = new Date().toISOString().split('T')[0];
	const now = new Date();
	const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

	const { data, error } = await supabase
		.from('time_slots')
		.select(`
      *,
      schedule_period:schedule_periods!inner(
        id,
        city_id,
        start_date,
        end_date
      )
    `)
		.eq('schedule_period.city_id', cityId)
		.eq('is_booked', false)
		.or(`slot_date.gt.${today},and(slot_date.eq.${today},slot_time.gt.${currentTime})`)
		.order('slot_date')
		.order('slot_time');

	if (error) {
		console.error('Error fetching available slots:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить доступные даты для бронирования по городу
 * Возвращает список уникальных дат, на которые есть хотя бы один свободный слот
 */
export async function getAvailableDatesByCity(
	cityId: string
): Promise<AvailableDate[]> {
	const slots = await getAvailableSlotsByCity(cityId);

	// Группируем по датам
	const dateMap = new Map<string, number>();
	slots.forEach((slot) => {
		const count = dateMap.get(slot.slot_date) || 0;
		dateMap.set(slot.slot_date, count + 1);
	});

	// Преобразуем в массив объектов
	const dates: AvailableDate[] = Array.from(dateMap.entries()).map(
		([date, availableSlots]) => ({
			date,
			availableSlots,
		})
	);

	return dates;
}

/**
 * Получить доступные слоты для конкретной даты и города
 */
export async function getAvailableSlotsByDate(
	cityId: string,
	date: string
): Promise<SlotForBooking[]> {
	const now = new Date();
	const today = new Date().toISOString().split('T')[0];
	const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

	const { data, error } = await supabase
		.from('time_slots')
		.select(`
      *,
      schedule_period:schedule_periods!inner(
        id,
        city_id,
        start_date,
        end_date
      )
    `)
		.eq('schedule_period.city_id', cityId)
		.eq('slot_date', date)
		.eq('is_booked', false)
		.gte('slot_time', date === today ? currentTime : '00:00:00')
		.order('slot_time');

	if (error) {
		console.error('Error fetching available slots by date:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить слот по ID (для проверки доступности перед бронированием)
 */
export async function getTimeSlotById(id: string): Promise<TimeSlot | null> {
	const { data, error } = await supabase
		.from('time_slots')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error fetching time slot:', error);
		throw error;
	}

	return data;
}

/**
 * Забронировать слот (только для админа, клиенты используют RPC create_booking)
 */
export async function markSlotAsBooked(id: string): Promise<TimeSlot> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('time_slots')
		.update({ is_booked: true } as never)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error marking slot as booked:', error);
		throw error;
	}

	return data;
}

/**
 * Освободить слот (только для админа)
 */
export async function markSlotAsAvailable(id: string): Promise<TimeSlot> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('time_slots')
		.update({ is_booked: false } as never)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error marking slot as available:', error);
		throw error;
	}

	return data;
}

/**
 * Получить все слоты (админ) с фильтрацией
 */
export async function getAllTimeSlots(filters?: {
	cityId?: string;
	periodId?: string;
	isBooked?: boolean;
	dateFrom?: string;
	dateTo?: string;
}): Promise<TimeSlotWithPeriod[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	let query = supabaseAdmin.from('time_slots').select(`
    *,
    schedule_period:schedule_periods(
      *,
      city:cities(*)
    )
  `);

	if (filters?.periodId) {
		query = query.eq('period_id', filters.periodId);
	}

	if (filters?.cityId) {
		query = query.eq('schedule_period.city_id', filters.cityId);
	}

	if (filters?.isBooked !== undefined) {
		query = query.eq('is_booked', filters.isBooked);
	}

	if (filters?.dateFrom) {
		query = query.gte('slot_date', filters.dateFrom);
	}

	if (filters?.dateTo) {
		query = query.lte('slot_date', filters.dateTo);
	}

	query = query.order('slot_date').order('slot_time');

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching all time slots:', error);
		throw error;
	}

	return data || [];
}
