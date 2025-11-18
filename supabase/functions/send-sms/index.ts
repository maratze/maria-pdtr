// Supabase Edge Function для отправки SMS
// Используется для отправки кодов подтверждения телефонов

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
	phone: string
	code: string
}

serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		const { phone, code } = await req.json() as RequestBody

		if (!phone || !code) {
			return new Response(
				JSON.stringify({ error: 'Phone and code are required' }),
				{
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			)
		}

		// Очищаем номер телефона от пробелов и символов
		const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

		// Интеграция с SMS.ru
		const SMS_API_KEY = Deno.env.get('SMS_RU_API_KEY')

		console.log(`SMS_API_KEY present: ${!!SMS_API_KEY}`)

		if (SMS_API_KEY) {
			try {
				const message = `Ваш код подтверждения: ${code}`
				const smsUrl = `https://sms.ru/sms/send?api_id=${SMS_API_KEY}&to=${cleanPhone}&msg=${encodeURIComponent(message)}&json=1`
				console.log(`Sending SMS to ${cleanPhone}`)
				console.log(`SMS URL (without key): https://sms.ru/sms/send?api_id=***&to=${cleanPhone}&msg=${encodeURIComponent(message)}&json=1`)

				const response = await fetch(smsUrl)
				const result = await response.json()

				console.log('SMS.ru response:', JSON.stringify(result))

				if (result.status === 'OK') {
					console.log(`SMS sent successfully to ${cleanPhone}`)
					console.log(`SMS.ru full response:`, JSON.stringify(result))
					return new Response(
						JSON.stringify({
							success: true,
							message: 'Код подтверждения отправлен на ваш телефон',
							debug: result // Добавляем debug информацию
						}),
						{
							status: 200,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' },
						}
					)
				} else {
					console.error('SMS.ru error:', JSON.stringify(result))
					// Не fallback, а возвращаем ошибку
					return new Response(
						JSON.stringify({
							success: false,
							message: `Ошибка отправки SMS: ${result.status_text || JSON.stringify(result)}`,
						}),
						{
							status: 200,
							headers: { ...corsHeaders, 'Content-Type': 'application/json' },
						}
					)
				}
			} catch (smsError) {
				console.error('Failed to send SMS via SMS.ru:', smsError)
				const errorMsg = smsError instanceof Error ? smsError.message : String(smsError)
				return new Response(
					JSON.stringify({
						success: false,
						message: `Ошибка при отправке SMS: ${errorMsg}`,
					}),
					{
						status: 200,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					}
				)
			}
		}

		// Для разработки: просто логируем код в консоль
		console.log(`[DEV MODE] SMS to ${cleanPhone}: ${code}`)

		return new Response(
			JSON.stringify({
				success: true,
				message: `SMS код отправлен на ${cleanPhone} (DEV mode - код: ${code})`,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	} catch (error) {
		console.error('Error sending SMS:', error)
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		return new Response(
			JSON.stringify({ error: 'Failed to send SMS', details: errorMessage }),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
})
