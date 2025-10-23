import { useState, useEffect } from 'react'
import Dropdown from './Dropdown'
import type { City, SchedulePeriodWithCity } from '../types/booking'
import { generateSlotsForDateAndCity, type OptimizedBooking } from '../lib/slots'

interface EditPeriodDialogProps {
	isOpen: boolean
	period: SchedulePeriodWithCity | null
	cities: City[]
	periods?: SchedulePeriodWithCity[]
	bookings?: OptimizedBooking[]
	onClose: () => void
	onSubmit: (periodId: string, cityId: string, startTime: string, endTime: string) => Promise<void>
	isLoading?: boolean
}

export default function EditPeriodDialog({
	isOpen,
	period,
	cities,
	periods = [],
	bookings = [],
	onClose,
	onSubmit,
	isLoading = false,
}: EditPeriodDialogProps) {
	const [selectedCity, setSelectedCity] = useState<string>('')
	const [startTime, setStartTime] = useState('10:00')
	const [endTime, setEndTime] = useState('18:00')
	const [error, setError] = useState<string | null>(null)
	const [daySlots, setDaySlots] = useState<any[]>([])

	// Инициализируем значения при открытии диалога
	useEffect(() => {
		if (isOpen && period) {
			setSelectedCity(period.city_id)
			setStartTime(period.work_start_time.slice(0, 5))
			setEndTime(period.work_end_time.slice(0, 5))
			setError(null)

			// Генерируем слоты для этого дня
			const slots = generateSlotsForDateAndCity(periods, bookings, period.start_date, period.city_id)
			setDaySlots(slots)
		}
	}, [isOpen, period, periods, bookings])

	// Управляем скроллом body
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
		}

		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	if (!isOpen || !period) return null

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
			await onSubmit(period.id, selectedCity, startTime + ':00', endTime + ':00')
		} catch (err) {
			// Ошибка будет обработана в parent компоненте
			console.error('Error updating period:', err)
		}
	}

	const startDate = new Date(period.start_date + 'T00:00:00')
	const endDate = new Date(period.end_date + 'T00:00:00')
	const daysCount = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 !m-0"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Заголовок */}
				<div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex-shrink-0">
					<h2 className="text-base font-regular text-slate-900">Редактировать период</h2>
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Содержимое со скроллом */}
				<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-ocean-300 scrollbar-track-slate-100">
					{/* Информация о периоде */}
					<div className="p-4 bg-ocean-50 rounded-lg border border-ocean-200">
						<p className="text-xs text-slate-600 font-medium mb-2 uppercase tracking-wide">Период</p>
						<p className="text-sm font-medium text-ocean-700">
							{startDate.toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})} - {endDate.toLocaleDateString('ru-RU', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</p>
						<p className="text-sm text-slate-500 mt-1 font-regular">{daysCount} {daysCount === 1 ? 'день' : 'дней'}</p>
					</div>

					{/* Ошибка */}
					{error && (
						<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex gap-2">
								<svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<p className="text-sm text-red-800">{error}</p>
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
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors"
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
									className="w-full h-10 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none transition-colors"
								/>
							</div>
						</div>

						{/* Разделитель */}
						<div className="border-t border-slate-200"></div>

						{/* Слоты за день */}
						{daySlots.length > 0 && (
							<div>
								<p className="text-sm font-medium text-slate-700 mb-3">Слоты за день ({daySlots.length})</p>
								<div className="grid grid-cols-2 gap-2">
									{daySlots.map((slot, idx) => (
										<div
											key={idx}
											className={`px-3 py-2 rounded-lg text-sm flex flex-col items-center justify-center text-center ${slot.isBooked
												? 'bg-red-50 text-red-700 border border-red-200'
												: 'bg-green-50 text-green-700 border border-green-200'
												}`}
										>
											<span className="font-medium">{slot.startTime} - {slot.endTime}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</form>

				{/* Кнопки */}
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
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
						disabled={isLoading || !selectedCity || !startTime || !endTime || startTime >= endTime}
						className="flex-1 px-4 py-2.5 h-10 rounded-lg bg-ocean-600 text-white text-sm font-regular hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
						onClick={handleSubmit}
					>
						{isLoading ? 'Сохранение...' : 'Сохранить'}
					</button>
				</div>
			</div>
		</div>
	)
}
