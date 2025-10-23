import { useState } from 'react'
import Dropdown from './Dropdown'
import type { City, SchedulePeriodWithCity } from '../types/booking'

interface CreatePeriodDialogProps {
	isOpen: boolean
	startDate: string | null
	endDate: string | null
	cities: City[]
	existingPeriods: SchedulePeriodWithCity[]
	onClose: () => void
	onSubmit: (cityId: string, startTime: string, endTime: string) => Promise<void>
	isLoading?: boolean
}

export default function CreatePeriodDialog({
	isOpen,
	startDate,
	endDate,
	cities,
	existingPeriods,
	onClose,
	onSubmit,
	isLoading = false,
}: CreatePeriodDialogProps) {
	const [selectedCity, setSelectedCity] = useState<string>('')
	const [startTime, setStartTime] = useState('10:00')
	const [endTime, setEndTime] = useState('18:00')
	const [error, setError] = useState<string | null>(null)

	if (!isOpen || !startDate) return null

	// Используем startDate если endDate не установлена (для однодневного периода)
	const endDateValue = endDate || startDate

	// Проверяем пересечение дат
	const hasDateConflict = existingPeriods.some(period => {
		const periodStart = new Date(period.start_date).getTime()
		const periodEnd = new Date(period.end_date).getTime()
		const rangeStart = new Date(startDate).getTime()
		const rangeEnd = new Date(endDateValue).getTime()

		// Проверяем пересечение
		return !(rangeEnd < periodStart || rangeStart > periodEnd)
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!selectedCity) {
			setError('Выберите город')
			return
		}

		if (!startTime || !endTime) {
			setError('Заполните время работы')
			return
		}

		if (startTime >= endTime) {
			setError('Время окончания должно быть позже времени начала')
			return
		}

		try {
			// Закрываем диалог сразу же
			setSelectedCity('')
			setStartTime('10:00')
			setEndTime('18:00')
			setError(null)
			onClose()

			// Затем выполняем submit в фоне
			await onSubmit(selectedCity, startTime + ':00', endTime + ':00')
		} catch (err) {
			// Ошибка будет обработана в parent компоненте
			console.error('Error creating period:', err)
		}
	}

	const daysCount = Math.floor((new Date(endDateValue).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 !m-0"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Заголовок */}
				<div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
					<h2 className="text-base font-regular text-slate-900">Добавить период расписания</h2>
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Содержимое */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{/* Информация о диапазоне */}
					<div className="p-4 bg-ocean-50 rounded-lg border border-ocean-200">
						<p className="text-xs text-slate-600 font-medium mb-2 uppercase tracking-wide">Период</p>
						<p className="text-sm font-medium text-ocean-700">
							{new Date(startDate + 'T00:00:00').toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})} - {new Date(endDateValue + 'T00:00:00').toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</p>
						<p className="text-sm text-slate-500 mt-1 font-regular">{daysCount} {daysCount === 1 ? 'день' : 'дней'}</p>
					</div>

					{/* Предупреждение о конфликте дат */}
					{hasDateConflict && (
						<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
							<div className="flex gap-2">
								<svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p className="text-sm text-amber-800">В выбранный период уже добавлены рабочие периоды. Выберите другие даты.</p>
							</div>
						</div>
					)}

					{/* Выбор города и время */}
					<div className="space-y-4">
						{/* Выбор города */}
						<div>
							<Dropdown
								options={cities.map(city => ({ id: city.id, label: city.name }))}
								value={selectedCity ? selectedCity : null}
								onChange={(value) => {
									if (value !== null && value !== undefined) {
										setSelectedCity(String(value))
										// Очищаем ошибку только когда город выбран (dropdown закрывается)
										setError(null)
									} else {
										setSelectedCity('')
									}
								}}
								label="Город"
								placeholder="Выберите город..."
								required={false}
							/>
						</div>

						{/* Время начала и окончания на одной строке */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Начало <span className="text-red-500">*</span>
								</label>
								<input
									type="time"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									disabled={hasDateConflict}
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Окончание <span className="text-red-500">*</span>
								</label>
								<input
									type="time"
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
									disabled={hasDateConflict}
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
								/>
							</div>
						</div>
					</div>

					{/* Кнопки */}
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="flex-1 px-4 py-2.5 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={isLoading || hasDateConflict || !selectedCity || !startTime || !endTime || startTime >= endTime}
							className="flex-1 px-4 py-2.5 h-10 rounded-lg bg-green-600 text-white text-sm font-regular hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
						>
							{isLoading ? 'Создание...' : 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

