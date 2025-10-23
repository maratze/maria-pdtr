import { supabase, supabaseAdmin } from './supabaseClient'
import type { Service, ServiceInsert, ServiceUpdate } from '../types/service'

// Public API: Get all services
export async function getServices() {
	const { data, error } = await supabase
		.from('services')
		.select('*')
		.order('display_order', { ascending: true })

	return { data: data as Service[] | null, error }
}

// Public API: Get a single service by ID
export async function getServiceById(id: string) {
	const { data, error } = await supabase
		.from('services')
		.select('*')
		.eq('id', id)
		.single()

	return { data: data as Service | null, error }
}

// Admin API: Create a service
export async function createService(service: ServiceInsert) {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('services')
		.insert([service] as any)
		.select()

	return { data: data as Service[] | null, error }
}

// Admin API: Update a service
export async function updateService(id: string, updates: ServiceUpdate) {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('services')
		.update(updates as never)
		.eq('id', id)
		.select()

	return { data: data as Service[] | null, error }
}

// Admin API: Delete a service
export async function deleteService(id: string) {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('services')
		.delete()
		.eq('id', id)
		.select()

	return { data: data as Service[] | null, error }
}
