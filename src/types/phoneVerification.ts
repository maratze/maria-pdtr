export interface PhoneVerificationCode {
	id: string
	phone: string
	code: string
	created_at: string
	expires_at: string
	verified: boolean
	attempts: number
}
