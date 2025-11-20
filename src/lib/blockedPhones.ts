import { supabase, supabaseAdmin } from './supabaseClient'

export interface BlockedPhone {
	id: string
	phone: string
	reason: string | null
	blocked_at: string
	blocked_by: string | null
}

/**
 * Check if phone number is blocked
 * @param phone - Phone number in any format
 * @returns True if blocked
 */
export async function isPhoneBlocked(phone: string): Promise<boolean> {
	try {
		const cleanPhone = phone.replace(/\s/g, '')

		const { data, error } = await supabase
			.from('blocked_phones')
			.select('id')
			.eq('phone', cleanPhone)
			.maybeSingle()

		return !error && data !== null
	} catch (error) {
		console.error('Error checking if phone is blocked:', error)
		return false
	}
}

/**
 * Get all blocked phones (admin only)
 */
export async function getBlockedPhones(): Promise<BlockedPhone[]> {
	try {
		const { data, error } = await supabaseAdmin
			.from('blocked_phones')
			.select('*')
			.order('blocked_at', { ascending: false })

		if (error) throw error
		return (data as unknown as BlockedPhone[]) || []
	} catch (error) {
		console.error('Error fetching blocked phones:', error)
		return []
	}
}

/**
 * Block a phone number (admin only)
 * @param phone - Phone number to block
 * @param reason - Reason for blocking
 * @param blockedBy - Admin email/name who blocked
 */
export async function blockPhone(
	phone: string,
	reason: string = '',
	blockedBy: string = 'admin'
): Promise<{ success: boolean; error?: string }> {
	try {
		const cleanPhone = phone.replace(/\s/g, '')

		// First, delete all bookings for this phone number (try both formats)
		// Try with spaces removed
		const { error: deleteError1 } = await supabaseAdmin
			.from('bookings')
			.delete()
			.eq('client_phone', cleanPhone)

		// Try with original format (with spaces)
		const { error: deleteError2 } = await supabaseAdmin
			.from('bookings')
			.delete()
			.eq('client_phone', phone)

		if (deleteError1 || deleteError2) {
			console.error('Error deleting bookings:', deleteError1, deleteError2)
			// Continue with blocking even if deletion fails
		}

		// Then block the phone number
		// @ts-ignore - Supabase types not updated
		const { error } = await supabaseAdmin
			.from('blocked_phones')
			.insert({
				phone: cleanPhone,
				reason: reason,
				blocked_by: blockedBy
			})

		if (error) {
			if (error.code === '23505') {
				return { success: false, error: 'Этот номер уже заблокирован' }
			}
			throw error
		}

		return { success: true }
	} catch (error) {
		console.error('Error blocking phone:', error)
		return { success: false, error: 'Ошибка при блокировке номера' }
	}
}

/**
 * Unblock a phone number (admin only)
 * @param phoneId - ID of blocked phone record
 */
export async function unblockPhone(phoneId: string): Promise<{ success: boolean; error?: string }> {
	try {
		const { error } = await supabaseAdmin
			.from('blocked_phones')
			.delete()
			.eq('id', phoneId)

		if (error) throw error

		return { success: true }
	} catch (error) {
		console.error('Error unblocking phone:', error)
		return { success: false, error: 'Ошибка при разблокировке номера' }
	}
}
