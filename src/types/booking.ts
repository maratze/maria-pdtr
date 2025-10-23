export interface City {
	id: string
	name: string
	slug: string
	display_order: number
	created_at?: string
}

export interface SchedulePeriod {
	id: string
	city_id: string
	start_date: string // ISO date string (YYYY-MM-DD)
	end_date: string // ISO date string (YYYY-MM-DD)
	work_start_time: string // HH:MM:SS
	work_end_time: string // HH:MM:SS
	created_at?: string
	updated_at?: string
}

export interface SchedulePeriodInsert {
	city_id: string
	start_date: string
	end_date: string
	work_start_time: string
	work_end_time: string
}

export interface SchedulePeriodUpdate {
	city_id?: string
	start_date?: string
	end_date?: string
	work_start_time?: string
	work_end_time?: string
}

// Расширенный тип с информацией о городе
export interface SchedulePeriodWithCity extends SchedulePeriod {
	city?: City
}

export interface TimeSlot {
	id: string
	period_id: string
	slot_date: string // ISO date string (YYYY-MM-DD)
	start_time: string // HH:MM:SS
	end_time: string // HH:MM:SS
	is_booked: boolean
	created_at?: string
}

export interface TimeSlotUpdate {
	is_booked?: boolean
}

// Расширенный тип с информацией о периоде
export interface TimeSlotWithPeriod extends TimeSlot {
	period?: SchedulePeriod
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
	id: string
	slot_id: string
	service_id: string | null
	client_name: string
	client_phone: string
	client_email: string
	status: BookingStatus
	notes: string | null
	created_at?: string
	updated_at?: string
}

export interface BookingInsert {
	slot_id: string
	service_id?: string | null
	client_name: string
	client_phone: string
	client_email: string
}

export interface BookingUpdate {
	service_id?: string | null
	client_name?: string
	client_phone?: string
	client_email?: string
	status?: BookingStatus
	notes?: string
}

// Расширенный тип с информацией о слоте и услуге
export interface BookingWithDetails extends Booking {
	slot?: TimeSlot
	service?: {
		id: string
		title: string
		price: number
	}
}

// Для отображения в календаре/списке с полной информацией
export interface BookingFull extends Booking {
	time_slot: TimeSlotWithPeriod
	service: {
		id: string
		title: string
		description: string | null
		price: number
	} | null
	city: City
}

export interface BookingFilters {
	city_id?: string
	status?: BookingStatus
	date_from?: string
	date_to?: string
	service_id?: string
	search?: string // поиск по имени/телефону/email
}

// Для отображения доступных дат
export interface AvailableDate {
	date: string
	availableSlots: number
}

// Для отображения слотов на конкретную дату
export interface SlotForBooking {
	id: string
	period_id: string
	slot_date: string
	start_time: string
	end_time: string
	is_booked: boolean
}

// Данные для создания бронирования через RPC функцию
export interface CreateBookingParams {
	slot_id: string
	service_id: string | null
	client_name: string
	client_phone: string
	client_email: string
}
