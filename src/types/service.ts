export type DurationType = 'minutes' | 'sessions' | 'hours' | 'none'

export interface Service {
	id: string
	title: string
	description: string | null
	duration_from: number
	duration_to: number
	duration_type: DurationType
	price: number
	price_from: boolean // true если "от X ₽"
	display_order: number
	created_at?: string
	updated_at?: string
}

export interface ServiceInsert {
	title: string
	description?: string
	duration_from: number
	duration_to: number
	duration_type: DurationType
	price: number
	price_from?: boolean
	display_order?: number
}

export interface ServiceUpdate {
	title?: string
	description?: string
	duration_from?: number
	duration_to?: number
	duration_type?: DurationType
	price?: number
	price_from?: boolean
	display_order?: number
}
