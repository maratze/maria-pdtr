import { supabase, supabaseAdmin } from './supabaseClient'
import type { Case, CaseInsert, CaseUpdate } from '../types/case'

// Public API: Get all cases
export async function getCases() {
	const { data, error } = await supabase
		.from('cases')
		.select('*')
		.order('created_at', { ascending: false })

	return { data: data as Case[] | null, error }
}

// Public API: Get a single case by ID
export async function getCaseById(id: string) {
	const { data, error } = await supabase
		.from('cases')
		.select('*')
		.eq('id', id)
		.single()

	return { data: data as Case | null, error }
}

// Admin API: Create a case
export async function createCase(caseData: CaseInsert) {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('cases')
		.insert([caseData] as any)
		.select()

	return { data: data as Case[] | null, error }
}

// Admin API: Update a case
export async function updateCase(id: string, updates: CaseUpdate) {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('cases')
		.update(updates as never)
		.eq('id', id)
		.select()

	return { data: data as Case[] | null, error }
}

// Admin API: Delete a case
export async function deleteCase(id: string) {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('cases')
		.delete()
		.eq('id', id)

	return { data, error }
}

// Admin API: List all cases (for admin panel)
export async function listAllCases() {
	if (!supabaseAdmin) {
		return {
			data: null,
			error: new Error('Admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY')
		}
	}

	const { data, error } = await supabaseAdmin
		.from('cases')
		.select('*')
		.order('created_at', { ascending: false })

	return { data: data as Case[] | null, error }
}
