import { useState } from 'react'
import type { City } from '../types/booking'

interface CreatePeriodDialogProps {
	isOpen: boolean
	startDate: string | null
	endDate: string | null
	cities: City[]
	onClose: () => void
	onSubmit: (cityId: string, startTime: string, endTime: string) => Promise<void>
	isLoading?: boolean
}

export default function CreatePeriodDialog({
	isOpen,
	startDate,
	endDate,
	cities,
	onClose,
	onSubmit,
	isLoading = false,
}: CreatePeriodDialogProps) {
	const [selectedCity, setSelectedCity] = useState<string>('')
	const [startTime, setStartTime] = useState('10:00')
	const [endTime, setEndTime] = useState('18:00')
	const [error, setError] = useState<string | null>(null)

	if (!isOpen || !startDate || !endDate) return null

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
			await onSubmit(selectedCity, startTime + ':00', endTime + ':00')
			// Очищаем форму
			setSelectedCity('')
			setStartTime('10:00')
			setEndTime('18:00')
			setError(null)
			onClose()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при создании периода')
		}
	}

	const daysCount = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
				{/* Заголовок */}
				<div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
					<h2 className="text-lg font-bold text-slate-900">Добавить период расписания</h2>
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Содержимое */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					{/* Информация о диапазоне */}
					<div className="p-3 bg-ocean-50 rounded-lg border border-ocean-200">
						<p className="text-xs text-slate-600 mb-1">Период:</p>
						<p className="text-sm font-semibold text-ocean-700">
							{new Date(startDate + 'T00:00:00').toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
							})} - {new Date(endDate + 'T00:00:00').toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
							})}
						</p>
						<p className="text-xs text-slate-500 mt-1">({daysCount} дней)</p>
					</div>

					{/* Выбор города */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Город
						</label>
						<select
							value={selectedCity}
							onChange={(e) => setSelectedCity(e.target.value)}
							className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
						>
							<option value="">Выберите город...</option>
							{cities.map((city) => (
								<option key={city.id} value={city.id}>
									{city.name}
								</option>
							))}
						</select>
					</div>

					{/* Время начала */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Время начала работы
						</label>
						<input
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
						/>
					</div>

					{/* Время окончания */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-2">
							Время окончания работы
						</label>
						<input
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
						/>
					</div>

					{/* Сообщение об ошибке */}
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<p className="text-sm text-red-700">{error}</p>
						</div>
					)}

					{/* Кнопки */}
					<div className="flex gap-2 pt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
						>
							Отмена
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="flex-1 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors font-medium disabled:opacity-50"
						>
							{isLoading ? 'Создание...' : 'Создать'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
