/**
 * Утилиты для защиты от спама и злоупотреблений при бронировании
 */

/**
 * Генерирует уникальный fingerprint браузера/устройства
 * Использует различные характеристики браузера для создания отпечатка
 */
export function generateClientFingerprint(): string {
	const nav = navigator as any;
	const components = [
		navigator.userAgent,
		navigator.language,
		screen.colorDepth,
		screen.width + 'x' + screen.height,
		new Date().getTimezoneOffset(),
		navigator.hardwareConcurrency || 'unknown',
		nav.deviceMemory || 'unknown',
		navigator.platform,
	];

	// Добавляем доступные плагины
	if (navigator.plugins) {
		const plugins = Array.from(navigator.plugins)
			.map(p => p.name)
			.sort()
			.join(',');
		components.push(plugins);
	}

	// Canvas fingerprinting (легковесная версия)
	try {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.textBaseline = 'top';
			ctx.font = '14px Arial';
			ctx.fillText('Browser fingerprint', 2, 2);
			components.push(canvas.toDataURL());
		}
	} catch (e) {
		// Игнорируем ошибки canvas
	}

	// Простой хеш из компонентов
	return simpleHash(components.join('|||'));
}

/**
 * Простая хеш-функция
 */
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(36);
}

/**
 * Получить IP-адрес клиента (требует бэкенд или сервис)
 * В production используйте реальный API или получайте IP на сервере
 */
export async function getClientIP(): Promise<string | null> {
	try {
		// Вариант 1: Использовать бесплатный API
		const response = await fetch('https://api.ipify.org?format=json');
		const data = await response.json();
		return data.ip;
	} catch (error) {
		console.error('Failed to get client IP:', error);
		return null;
	}
}

/**
 * Альтернатива - получение IP через Cloudflare (если используется)
 */
export function getClientIPFromHeaders(request: Request): string | null {
	// В Cloudflare Workers или Edge Functions
	const cfIP = request.headers.get('CF-Connecting-IP');
	if (cfIP) return cfIP;

	// В Vercel
	const vercelIP = request.headers.get('x-real-ip');
	if (vercelIP) return vercelIP;

	// Стандартные заголовки
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	return null;
}

/**
 * Получить конфигурацию honeypot поля для защиты от ботов
 * Используйте в JSX компоненте
 */
export function getHoneypotFieldConfig() {
	return {
		fieldName: 'website', // Боты часто заполняют поля с такими именами
		style: {
			position: 'absolute' as const,
			left: '-9999px',
			width: '1px',
			height: '1px',
			opacity: 0,
		},
		attributes: {
			type: 'text',
			name: 'website',
			id: 'website',
			autoComplete: 'off',
			tabIndex: -1,
			'aria-hidden': 'true',
		},
	};
}

/**
 * Проверка honeypot поля
 */
export function checkHoneypot(fieldValue: string): boolean {
	// Если поле заполнено - это бот
	return fieldValue === '' || fieldValue === undefined || fieldValue === null;
}

/**
 * Задержка для предотвращения слишком быстрых отправок форм
 */
export function createFormTimingCheck() {
	const startTime = Date.now();

	return {
		check: () => {
			const elapsed = Date.now() - startTime;
			// Если форма заполнена менее чем за 2 секунды - подозрительно
			return elapsed >= 2000;
		},
		getElapsed: () => Date.now() - startTime,
	};
}

/**
 * Нормализация номера телефона для последовательной проверки
 */
export function normalizePhoneNumber(phone: string): string {
	// Удаляем все кроме цифр
	return phone.replace(/\D/g, '');
}

/**
 * Базовая валидация email
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Проверка на одноразовые email-сервисы
 */
export function isDisposableEmail(email: string): boolean {
	const disposableDomains = [
		'tempmail.com',
		'10minutemail.com',
		'guerrillamail.com',
		'mailinator.com',
		'throwaway.email',
		'temp-mail.org',
		// Добавьте другие известные домены
	];

	const domain = email.split('@')[1]?.toLowerCase();
	return disposableDomains.includes(domain);
}

/**
 * Создать задержку перед повторной попыткой
 */
export function exponentialBackoff(attempt: number): number {
	// 1-я попытка: 0ms, 2-я: 1s, 3-я: 2s, 4-я: 4s, и т.д.
	return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
}
