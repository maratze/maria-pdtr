import { supabaseAdmin } from './supabaseClient';
import type {
	SchedulePeriod,
	SchedulePeriodInsert,
	SchedulePeriodUpdate,
	SchedulePeriodWithCity,
} from '../types/booking';

/**
 * Получить все периоды расписания с информацией о городах
 */
export async function getSchedulePeriods(): Promise<SchedulePeriodWithCity[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.select(`
      *,
      city:cities(*)
    `)
		.order('start_date', { ascending: false });

	if (error) {
		console.error('Error fetching schedule periods:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить периоды расписания по городу
 */
export async function getSchedulePeriodsByCity(
	cityId: string
): Promise<SchedulePeriodWithCity[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.select(`
      *,
      city:cities(*)
    `)
		.eq('city_id', cityId)
		.order('start_date', { ascending: false });

	if (error) {
		console.error('Error fetching schedule periods by city:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить период расписания по ID
 */
export async function getSchedulePeriodById(
	id: string
): Promise<SchedulePeriodWithCity | null> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.select(`
      *,
      city:cities(*)
    `)
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error fetching schedule period:', error);
		throw error;
	}

	return data;
}

/**
 * Явно генерировать слоты для периода
 */
export async function generateSlotsForPeriod(periodId: string): Promise<void> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { error } = await supabaseAdmin.rpc('generate_time_slots_for_period', {
		p_period_id: periodId,
	} as any);

	if (error) {
		console.error('Error generating slots:', error);
		throw error;
	}
}

/**
 * Создать новый период расписания
 * Автоматически создаст слоты времени через триггер
 */
export async function createSchedulePeriod(
	period: SchedulePeriodInsert
): Promise<SchedulePeriod> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.insert(period as never)
		.select()
		.single();

	if (error) {
		console.error('Error creating schedule period:', error);
		throw error;
	}

	// Ждем немного, чтобы триггер срабатал, затем генерируем слоты явно
	if ((data as any)?.id) {
		await new Promise(resolve => setTimeout(resolve, 500));
		try {
			await generateSlotsForPeriod((data as any).id);
		} catch (slotError) {
			console.warn('Slots may already be generating via trigger:', slotError);
		}
	}

	return data;
}

/**
 * Обновить период расписания
 * При изменении дат/времени автоматически пересоздаст слоты через триггер
 */
export async function updateSchedulePeriod(
	id: string,
	updates: SchedulePeriodUpdate
): Promise<SchedulePeriod> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.update(updates as never)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error updating schedule period:', error);
		throw error;
	}

	// Ждем и регенерируем слоты
	await new Promise(resolve => setTimeout(resolve, 500));
	try {
		await generateSlotsForPeriod(id);
	} catch (slotError) {
		console.warn('Slots may already be regenerating via trigger:', slotError);
	}

	return data;
}

/**
 * Удалить период расписания
 * Каскадно удалит все связанные слоты
 */
export async function deleteSchedulePeriod(id: string): Promise<void> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { error } = await supabaseAdmin
		.from('schedule_periods')
		.delete()
		.eq('id', id);

	if (error) {
		console.error('Error deleting schedule period:', error);
		throw error;
	}
}

/**
 * Получить активные периоды расписания (которые еще не закончились)
 */
export async function getActiveSchedulePeriods(): Promise<SchedulePeriodWithCity[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const today = new Date().toISOString().split('T')[0];

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.select(`
      *,
      city:cities(*)
    `)
		.gte('end_date', today)
		.order('start_date', { ascending: true });

	if (error) {
		console.error('Error fetching active schedule periods:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить активные периоды расписания для конкретного города
 */
export async function getActiveSchedulePeriodsByCity(
	cityId: string
): Promise<SchedulePeriodWithCity[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const today = new Date().toISOString().split('T')[0];

	const { data, error } = await supabaseAdmin
		.from('schedule_periods')
		.select(`
      *,
      city:cities(*)
    `)
		.eq('city_id', cityId)
		.gte('end_date', today)
		.order('start_date', { ascending: true });

	if (error) {
		console.error('Error fetching active schedule periods by city:', error);
		throw error;
	}

	return data || [];
}

/**
 * Создать периоды расписания на каждый день в диапазоне
 * Автоматически создаст слоты времени через триггер
 */
export async function createSchedulePeriodsForDateRange(
	startDate: string,
	endDate: string,
	cityId: string,
	workStartTime: string,
	workEndTime: string
): Promise<SchedulePeriod[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const createdPeriods: SchedulePeriod[] = [];
	const current = new Date(startDate + 'T00:00:00');
	const end = new Date(endDate + 'T00:00:00');

	while (current <= end) {
		const dateStr = current.toISOString().split('T')[0];

		const { data, error } = await supabaseAdmin
			.from('schedule_periods')
			.insert({
				city_id: cityId,
				start_date: dateStr,
				end_date: dateStr,
				work_start_time: workStartTime,
				work_end_time: workEndTime,
			} as never)
			.select()
			.single();

		if (error) {
			console.error(`Error creating schedule period for ${dateStr}:`, error);
			throw error;
		}

		createdPeriods.push(data);

		// Ждем немного, чтобы триггер срабатал
		await new Promise(resolve => setTimeout(resolve, 300));

		// Генерируем слоты явно
		if ((data as any)?.id) {
			try {
				await generateSlotsForPeriod((data as any).id);
			} catch (slotError) {
				console.warn(`Slots may already be generating via trigger for ${dateStr}:`, slotError);
			}
		}

		current.setDate(current.getDate() + 1);
	}

	return createdPeriods;
}
