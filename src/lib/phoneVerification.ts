import { supabase } from './supabaseClient'
import type { PhoneVerificationCode } from '../types/phoneVerification'

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send SMS verification code to phone number
 * @param phone - Phone number in format +7 XXX XXX XX XX
 * @returns Success status and message
 */
export async function sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
	try {
		// Remove spaces and formatting from phone
		const cleanPhone = phone.replace(/\s/g, '')

		// Generate 6-digit code
		const code = generateVerificationCode()

		// Store code in database
		// @ts-ignore - Supabase types not updated for new table
		const { error } = await supabase
			.from('phone_verification_codes')
			.insert({
				phone: cleanPhone,
				code: code,
				expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
				verified: false,
				attempts: 0
			})

		if (error) {
			console.error('Error storing verification code:', error)
			return { success: false, message: 'Ошибка при создании кода подтверждения' }
		}

		// Call Edge Function to send SMS
		const { error: smsError } = await supabase.functions.invoke('send-sms', {
			body: { phone: cleanPhone, code: code }
		})

		if (smsError) {
			console.error('Error sending SMS:', smsError)
			// For development: log code to console
			console.log(`[DEV] Verification code for ${cleanPhone}: ${code}`)
			return { success: true, message: `Код подтверждения (DEV): ${code}` }
		}

		return { success: true, message: 'Код подтверждения отправлен на ваш телефон' }
	} catch (error) {
		console.error('Error in sendVerificationCode:', error)
		return { success: false, message: 'Произошла ошибка при отправке кода' }
	}
}

/**
 * Verify the code entered by user
 * @param phone - Phone number in format +7 XXX XXX XX XX
 * @param code - 6-digit verification code
 * @returns Success status and message
 */
export async function verifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
	try {
		// Remove spaces and formatting from phone
		const cleanPhone = phone.replace(/\s/g, '')

		// Get the latest non-expired, non-verified code for this phone
		const { data: verificationData, error: fetchError } = await supabase
			.from('phone_verification_codes')
			.select('*')
			.eq('phone', cleanPhone)
			.eq('verified', false)
			.gt('expires_at', new Date().toISOString())
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()

		if (fetchError || !verificationData) {
			return { success: false, message: 'Код подтверждения не найден или истек. Запросите новый код.' }
		}

		const record = verificationData as unknown as PhoneVerificationCode

		// Check if too many attempts
		if (record.attempts >= 5) {
			return { success: false, message: 'Превышено количество попыток. Запросите новый код.' }
		}

		// Check if code matches
		if (record.code !== code) {
			// Increment attempts
			// @ts-ignore - Supabase types not updated for new table
			await supabase
				.from('phone_verification_codes')
				.update({ attempts: record.attempts + 1 })
				.eq('id', record.id)

			return { success: false, message: 'Неверный код подтверждения' }
		}

		// Mark as verified
		// @ts-ignore - Supabase types not updated for new table
		const { error: updateError } = await supabase
			.from('phone_verification_codes')
			.update({ verified: true })
			.eq('id', record.id)

		if (updateError) {
			console.error('Error updating verification status:', updateError)
			return { success: false, message: 'Ошибка при подтверждении кода' }
		}

		return { success: true, message: 'Телефон успешно подтвержден' }
	} catch (error) {
		console.error('Error in verifyCode:', error)
		return { success: false, message: 'Произошла ошибка при проверке кода' }
	}
}

/**
 * Check if phone number has been verified recently (within last hour)
 * @param phone - Phone number in format +7 XXX XXX XX XX
 * @returns True if phone is verified
 */
export async function isPhoneVerified(phone: string): Promise<boolean> {
	try {
		const cleanPhone = phone.replace(/\s/g, '')

		const { data, error } = await supabase
			.from('phone_verification_codes')
			.select('verified')
			.eq('phone', cleanPhone)
			.eq('verified', true)
			.gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Within last hour
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle()

		const record = data as unknown as PhoneVerificationCode | null
		return !error && record?.verified === true
	} catch (error) {
		console.error('Error checking phone verification:', error)
		return false
	}
}
