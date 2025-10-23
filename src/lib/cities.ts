import { supabase } from './supabaseClient';
import type { City } from '../types/booking';

/**
 * Получить список всех городов
 */
export async function getCities(): Promise<City[]> {
	const { data, error } = await supabase
		.from('cities')
		.select('*')
		.order('name');

	if (error) {
		console.error('Error fetching cities:', error);
		throw error;
	}

	return data || [];
}

/**
 * Получить город по ID
 */
export async function getCityById(id: string): Promise<City | null> {
	const { data, error } = await supabase
		.from('cities')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		console.error('Error fetching city:', error);
		throw error;
	}

	return data;
}
