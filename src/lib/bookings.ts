import { supabase, supabaseAdmin } from './supabaseClient';
import type {
	Booking,
	BookingUpdate,
	BookingWithDetails,
	BookingFull,
	BookingFilters,
	CreateBookingParams,
} from '../types/booking';

/**
 * Получить все бронирования с фильтрами (для админа)
 */
export async function getAllBookings(
	filters?: BookingFilters
): Promise<BookingFull[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	let query = supabaseAdmin.from('bookings').select(`
    *,
    time_slot:time_slots(
      *,
      schedule_period:schedule_periods(
        *,
        city:cities(*)
      )
    ),
    service:services(
      id,
      title,
      description,
      price
    )
  `);

	if (filters?.status) {
		query = query.eq('status', filters.status);
	}

	if (filters?.service_id) {
		query = query.eq('service_id', filters.service_id);
	}

	if (filters?.search) {
		query = query.or(
			`client_name.ilike.%${filters.search}%,client_phone.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%`
		);
	}

	// Фильтрация по городу и датам - через join с time_slots
	if (filters?.city_id) {
		query = query.eq('time_slot.schedule_period.city_id', filters.city_id);
	}

	if (filters?.date_from) {
		query = query.gte('time_slot.slot_date', filters.date_from);
	}

	if (filters?.date_to) {
		query = query.lte('time_slot.slot_date', filters.date_to);
	}

	query = query.order('created_at', { ascending: false });

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching bookings:', error);
		throw error;
	}

	// Добавляем информацию о городе из вложенного объекта
	const bookingsWithCity = (data || []).map((booking: any) => ({
		...booking,
		city: booking.time_slot?.schedule_period?.city || null,
	}));

	return bookingsWithCity;
}

/**
 * Получить бронирование по ID
 */
export async function getBookingById(id: string): Promise<BookingFull | null> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.select(`
      *,
      time_slot:time_slots(
        *,
        schedule_period:schedule_periods(
          *,
          city:cities(*)
        )
      ),
      service:services(
        id,
        title,
        description,
        price
      )
    `)
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error fetching booking:', error);
		throw error;
	}

	if (!data) {
		return null;
	}

	// Добавляем информацию о городе
	const bookingWithCity = {
		...(data as any),
		city: (data as any).time_slot?.schedule_period?.city || null,
	} as BookingFull;

	return bookingWithCity;
}

/**
 * Создать новое бронирование через RPC функцию (для клиентов)
 * Эта функция использует SECURITY DEFINER и автоматически обновляет is_booked
 */
export async function createBooking(
	params: CreateBookingParams
): Promise<{ success: boolean; booking_id?: string; error?: string }> {
	const { data, error } = await supabase.rpc('create_booking', {
		p_slot_id: params.slot_id,
		p_service_id: params.service_id,
		p_client_name: params.client_name,
		p_client_phone: params.client_phone,
		p_client_email: params.client_email,
	} as any);

	if (error) {
		console.error('Error creating booking:', error);
		return { success: false, error: error.message };
	}

	return data as { success: boolean; booking_id?: string; error?: string };
}

/**
 * Обновить бронирование (только для админа)
 */
export async function updateBooking(
	id: string,
	updates: BookingUpdate
): Promise<Booking> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.update(updates as never)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error updating booking:', error);
		throw error;
	}

	return data;
}

/**
 * Отменить бронирование (для админа)
 * Автоматически освободит слот через триггер
 */
export async function cancelBooking(id: string): Promise<Booking> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.update({ status: 'cancelled' } as never)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error('Error cancelling booking:', error);
		throw error;
	}

	return data;
}

/**
 * Удалить бронирование полностью (для админа)
 * Автоматически освободит слот через триггер
 */
export async function deleteBooking(id: string): Promise<void> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { error } = await supabaseAdmin.from('bookings').delete().eq('id', id);

	if (error) {
		console.error('Error deleting booking:', error);
		throw error;
	}
}

/**
 * Получить бронирования для конкретного слота
 */
export async function getBookingsBySlot(
	slotId: string
): Promise<BookingWithDetails[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.select(`
      *,
      slot:time_slots(*),
      service:services(
        id,
        title,
        price
      )
    `)
		.eq('slot_id', slotId);

	if (error) {
		console.error('Error fetching bookings by slot:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить предстоящие бронирования
 */
export async function getUpcomingBookings(): Promise<BookingFull[]> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const today = new Date().toISOString().split('T')[0];

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.select(`
      *,
      time_slot:time_slots(
        *,
        schedule_period:schedule_periods(
          *,
          city:cities(*)
        )
      ),
      service:services(
        id,
        title,
        description,
        price
      )
    `)
		.gte('time_slot.slot_date', today)
		.in('status', ['pending', 'confirmed'])
		.order('time_slot.slot_date')
		.order('time_slot.start_time');

	if (error) {
		console.error('Error fetching upcoming bookings:', error);
		throw error;
	}

	// Добавляем информацию о городе
	const bookingsWithCity = (data || []).map((booking: any) => ({
		...booking,
		city: booking.time_slot?.schedule_period?.city || null,
	}));

	return bookingsWithCity;
}

/**
 * Получить статистику бронирований
 */
export async function getBookingStats(): Promise<{
	total: number;
	pending: number;
	confirmed: number;
	cancelled: number;
	completed: number;
}> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.select('status');

	if (error) {
		console.error('Error fetching booking stats:', error);
		throw error;
	}

	const stats = {
		total: data.length,
		pending: 0,
		confirmed: 0,
		cancelled: 0,
		completed: 0,
	};

	(data as any[]).forEach((booking: any) => {
		switch (booking.status) {
			case 'pending':
				stats.pending++;
				break;
			case 'confirmed':
				stats.confirmed++;
				break;
			case 'cancelled':
				stats.cancelled++;
				break;
			case 'completed':
				stats.completed++;
				break;
		}
	});

	return stats;
}
