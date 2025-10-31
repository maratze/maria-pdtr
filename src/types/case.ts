export interface Case {
	id: string
	title: string
	problem: string
	solution: string
	result: string
	duration: string
	display_order: number
	created_at: string
	updated_at: string
}

export interface CaseInsert {
	title: string
	problem: string
	solution: string
	result: string
	duration: string
	display_order?: number
}

export interface CaseUpdate {
	title?: string
	problem?: string
	solution?: string
	result?: string
	duration?: string
	display_order?: number
}
