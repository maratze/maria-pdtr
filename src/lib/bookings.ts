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
 * Создать публичное бронирование (для клиентов на сайте)
 * Создает слот если его нет и затем бронирование
 */
export async function createPublicBooking(
	periodId: string,
	date: string,
	startTime: string,
	endTime: string,
	clientName: string,
	clientPhone: string,
	clientEmail: string
): Promise<{ success: boolean; booking_id?: string; error?: string }> {
	try {
		// Проверяем, существует ли слот
		const { data: existingSlot, error: slotCheckError } = await supabase
			.from('time_slots')
			.select('id, is_booked')
			.eq('period_id', periodId)
			.eq('slot_date', date)
			.eq('start_time', startTime + ':00')
			.eq('end_time', endTime + ':00')
			.maybeSingle() as { data: { id: string; is_booked: boolean } | null; error: any };

		if (slotCheckError) {
			console.error('Error checking slot:', slotCheckError);
			return { success: false, error: slotCheckError.message };
		}

		let slotId: string;

		if (existingSlot) {
			// Слот существует - проверяем, не забронирован ли он
			if (existingSlot.is_booked) {
				return {
					success: false,
					error: 'Этот слот уже забронирован. Пожалуйста, выберите другое время.'
				};
			}
			slotId = existingSlot.id;
		} else {
			// Слот не существует - создаем его
			const { data: newSlot, error: slotCreateError } = await supabase
				.from('time_slots')
				.insert({
					period_id: periodId,
					slot_date: date,
					start_time: startTime + ':00',
					end_time: endTime + ':00',
					is_booked: false,
				} as any)
				.select('id')
				.single() as { data: { id: string } | null; error: any };

			if (slotCreateError || !newSlot) {
				console.error('Error creating slot:', slotCreateError);
				return { success: false, error: slotCreateError?.message || 'Не удалось создать слот' };
			}

			slotId = newSlot.id;
		}

		// Создаем бронирование
		const { data: booking, error: bookingError } = await supabase
			.from('bookings')
			.insert({
				slot_id: slotId,
				service_id: null,
				client_name: clientName,
				client_phone: clientPhone,
				client_email: clientEmail,
				status: 'pending',
			} as any)
			.select('id')
			.single() as { data: { id: string } | null; error: any };

		if (bookingError || !booking) {
			console.error('Error creating booking:', bookingError);
			return { success: false, error: bookingError?.message || 'Не удалось создать бронирование' };
		}

		// Слот автоматически помечается как забронированный через триггеры БД

		return { success: true, booking_id: booking.id };
	} catch (error) {
		console.error('Error in createPublicBooking:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Неизвестная ошибка'
		};
	}
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
 * Получить бронирования для конкретного периода и даты
 */
export async function getBookingsByPeriodAndDate(
	periodId: string,
	date: string
): Promise<Array<{
	id: string;
	slot_id: string;
	start_time: string;
	end_time: string;
	client_name: string;
	client_phone: string;
	client_email: string;
	status: string;
}>> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	const { data, error } = await supabaseAdmin
		.from('bookings')
		.select(`
			id,
			slot_id,
			client_name,
			client_phone,
			client_email,
			status,
			time_slot:time_slots!inner(
				start_time,
				end_time,
				period_id,
				slot_date
			)
		`)
		.eq('time_slot.period_id', periodId)
		.eq('time_slot.slot_date', date)
		.in('status', ['pending', 'confirmed']);

	if (error) {
		console.error('Error fetching bookings by period and date:', error);
		throw error;
	}

	// Преобразуем данные в нужный формат
	return (data || []).map((item: any) => ({
		id: item.id,
		slot_id: item.slot_id,
		start_time: item.time_slot.start_time,
		end_time: item.time_slot.end_time,
		client_name: item.client_name,
		client_phone: item.client_phone,
		client_email: item.client_email,
		status: item.status,
	}));
}

/**
 * Получить бронирования для конкретного города и дат (публичная версия)
 */
export async function getPublicBookingsByCityAndDates(
	cityId: string,
	dateFrom: string,
	dateTo: string
): Promise<Array<{
	id: string;
	period_id: string;
	booking_date: string;
	start_time: string;
	end_time: string;
	status: string;
}>> {
	const { data, error } = await supabase
		.from('bookings')
		.select(`
			id,
			status,
			time_slot:time_slots!inner(
				start_time,
				end_time,
				period_id,
				slot_date,
				schedule_period:schedule_periods!inner(
					city_id
				)
			)
		`)
		.eq('time_slot.schedule_period.city_id', cityId)
		.gte('time_slot.slot_date', dateFrom)
		.lte('time_slot.slot_date', dateTo)
		.in('status', ['pending', 'confirmed']);

	if (error) {
		console.error('Error fetching public bookings:', error);
		throw error;
	}

	// Преобразуем данные в нужный формат
	return (data || []).map((item: any) => ({
		id: item.id,
		period_id: item.time_slot.period_id,
		booking_date: item.time_slot.slot_date,
		start_time: item.time_slot.start_time.slice(0, 5), // HH:MM
		end_time: item.time_slot.end_time.slice(0, 5), // HH:MM
		status: item.status,
	}));
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

/**
 * Создать бронирования для слотов администратором
 * Создает слоты в базе данных если их нет, затем создает бронирования
 */
export async function createBookingsForSlots(
	periodId: string,
	date: string,
	slots: Array<{ startTime: string; endTime: string }>,
	clientName: string,
	clientPhone: string,
	clientEmail: string
): Promise<{ success: boolean; bookings: string[]; error?: string }> {
	if (!supabaseAdmin) {
		throw new Error('Supabase admin client is not initialized');
	}

	try {
		const bookingIds: string[] = [];

		// Создаем слоты и бронирования для каждого выбранного слота
		for (const slot of slots) {
			// Проверяем, существует ли слот в базе данных
			const { data: existingSlot, error: slotCheckError } = await supabaseAdmin
				.from('time_slots')
				.select('id, is_booked')
				.eq('period_id', periodId)
				.eq('slot_date', date)
				.eq('start_time', slot.startTime + ':00')
				.eq('end_time', slot.endTime + ':00')
				.maybeSingle() as { data: { id: string; is_booked: boolean } | null; error: any };

			if (slotCheckError) {
				console.error('Error checking slot:', slotCheckError);
				return { success: false, bookings: bookingIds, error: slotCheckError.message };
			}

			let slotId: string;

			if (existingSlot) {
				// Слот существует - проверяем, не забронирован ли он
				if (existingSlot.is_booked) {
					return {
						success: false,
						bookings: bookingIds,
						error: `Слот ${slot.startTime}-${slot.endTime} уже забронирован`
					};
				}
				slotId = existingSlot.id;
			} else {
				// Слот не существует - создаем его
				const { data: newSlot, error: slotCreateError } = await supabaseAdmin
					.from('time_slots')
					.insert({
						period_id: periodId,
						slot_date: date,
						start_time: slot.startTime + ':00',
						end_time: slot.endTime + ':00',
						is_booked: false,
					} as any)
					.select('id')
					.single() as { data: { id: string } | null; error: any };

				if (slotCreateError || !newSlot) {
					console.error('Error creating slot:', slotCreateError);
					return { success: false, bookings: bookingIds, error: slotCreateError?.message || 'Failed to create slot' };
				}

				slotId = newSlot.id;
			}

			// Создаем бронирование
			const { data: booking, error: bookingError } = await supabaseAdmin
				.from('bookings')
				.insert({
					slot_id: slotId,
					service_id: null, // Админ может бронировать без услуги
					client_name: clientName,
					client_phone: clientPhone,
					client_email: clientEmail,
					status: 'confirmed',
				} as any)
				.select('id')
				.single() as { data: { id: string } | null; error: any };

			if (bookingError || !booking) {
				console.error('Error creating booking:', bookingError);
				return { success: false, bookings: bookingIds, error: bookingError?.message || 'Failed to create booking' };
			}

			// Слот автоматически помечается как забронированный через базовую логику
			// при наличии связанного бронирования

			bookingIds.push(booking.id);
		}

		return { success: true, bookings: bookingIds };
	} catch (error) {
		console.error('Error in createBookingsForSlots:', error);
		return {
			success: false,
			bookings: [],
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
