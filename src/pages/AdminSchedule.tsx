import { useEffect, useState } from 'react'
import type {
	SchedulePeriodWithCity,
	SchedulePeriodInsert,
	City,
} from '../types/booking'
import {
	getSchedulePeriods,
	createSchedulePeriod,
	updateSchedulePeriod,
	deleteSchedulePeriod,
} from '../lib/schedule'
import { getCities } from '../lib/cities'
import { getTimeSlotsByPeriod } from '../lib/timeSlots'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'
import CityDropdown from '../components/CityDropdown'
import ConfirmDialog from '../components/ConfirmDialog'

// Функция форматирования даты
function formatDateRange(startDate: string, endDate: string): string {
	const start = new Date(startDate + 'T00:00:00')
	const end = new Date(endDate + 'T00:00:00')

	const startDay = String(start.getDate()).padStart(2, '0')
	const startMonth = String(start.getMonth() + 1).padStart(2, '0')
	const startYear = start.getFullYear().toString().slice(-2)

	const endDay = String(end.getDate()).padStart(2, '0')
	const endMonth = String(end.getMonth() + 1).padStart(2, '0')
	const endYear = end.getFullYear().toString().slice(-2)

	return `${startDay}.${startMonth}.${startYear} - ${endDay}.${endMonth}.${endYear}`
}

export default function AdminSchedule() {
	const [periods, setPeriods] = useState<SchedulePeriodWithCity[]>([])
	const [cities, setCities] = useState<City[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingPeriod, setEditingPeriod] = useState<SchedulePeriodWithCity | null>(null)
	const [selectedCityFilter, setSelectedCityFilter] = useState<string>('')
	const [expandedPeriodId, setExpandedPeriodId] = useState<string | null>(null)
	const [periodSlots, setPeriodSlots] = useState<Record<string, any[]>>({})
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [formLoading, setFormLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

	// Форма
	const [formData, setFormData] = useState<SchedulePeriodInsert>({
		city_id: '',
		start_date: '',
		end_date: '',
		work_start_time: '10:00:00',
		work_end_time: '18:00:00',
	})

	// Функция проверки валидности формы
	const isFormValid = () => {
		return formData.city_id && formData.start_date && formData.end_date
	}

	useEffect(() => {
		loadInitialData()
	}, [])

	useEffect(() => {
		if (selectedCityFilter) {
			// Только обновляем данные при смене фильтра города
			// без полной перезагрузки страницы
		}
	}, [selectedCityFilter])

	async function loadInitialData() {
		try {
			setLoading(true)
			const [periodsData, citiesData] = await Promise.all([
				getSchedulePeriods(),
				getCities(),
			])
			setPeriods(periodsData)
			setCities(citiesData)
		} catch (error) {
			console.error('Error loading data:', error)
			setToast({ message: 'Ошибка загрузки данных', type: 'error' })
		} finally {
			setLoading(false)
		}
	}

	async function loadPeriodSlots(periodId: string) {
		if (periodSlots[periodId]) {
			return // Уже загружены
		}
		try {
			// Добавляем небольшую задержку для гарантии генерации слотов
			await new Promise(resolve => setTimeout(resolve, 500))
			const slots = await getTimeSlotsByPeriod(periodId)
			setPeriodSlots((prev) => ({ ...prev, [periodId]: slots }))

			if (slots.length === 0) {
				setToast({
					message: 'Слоты еще генерируются. Попробуйте еще раз через несколько секунд.',
					type: 'info'
				})
			}
		} catch (error) {
			console.error('Error loading slots:', error)
			setToast({ message: 'Ошибка загрузки слотов', type: 'error' })
		}
	}

	function handleExpandPeriod(periodId: string) {
		if (expandedPeriodId === periodId) {
			setExpandedPeriodId(null)
		} else {
			setExpandedPeriodId(periodId)
			loadPeriodSlots(periodId)
		}
	}

	function resetForm() {
		setFormData({
			city_id: '',
			start_date: '',
			end_date: '',
			work_start_time: '10:00:00',
			work_end_time: '18:00:00',
		})
		setEditingPeriod(null)
		setShowForm(false)
	}

	function handleEdit(period: SchedulePeriodWithCity) {
		setEditingPeriod(period)
		setFormData({
			city_id: period.city_id,
			start_date: period.start_date,
			end_date: period.end_date,
			work_start_time: period.work_start_time,
			work_end_time: period.work_end_time,
		})
		setShowForm(true)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		if (!formData.city_id || !formData.start_date || !formData.end_date) {
			return
		}

		try {
			setFormLoading(true)
			if (editingPeriod) {
				await updateSchedulePeriod(editingPeriod.id, formData)
				// Реактивное обновление
				const updated = await getSchedulePeriods()
				setPeriods(updated)
				setToast({ message: 'Период обновлен', type: 'success' })
			} else {
				await createSchedulePeriod(formData)
				// Реактивное обновление
				const updated = await getSchedulePeriods()
				setPeriods(updated)
				setToast({ message: 'Период создан', type: 'success' })
			}
			resetForm()
		} catch (error) {
			console.error('Error saving period:', error)
			setToast({ message: 'Ошибка сохранения периода', type: 'error' })
		} finally {
			setFormLoading(false)
		}
	}

	async function handleDelete(id: string) {
		setDeleteConfirmId(id)
	}

	async function confirmDelete() {
		if (!deleteConfirmId) return

		try {
			setDeleteLoading(true)
			await deleteSchedulePeriod(deleteConfirmId)
			// Реактивное удаление
			setPeriods(periods.filter((p) => p.id !== deleteConfirmId))
			setDeleteConfirmId(null)
			setToast({ message: 'Период удален', type: 'success' })
		} catch (error) {
			console.error('Error deleting period:', error)
			setToast({ message: 'Ошибка удаления периода', type: 'error' })
		} finally {
			setDeleteLoading(false)
		}
	}

	const filteredPeriods = selectedCityFilter
		? periods.filter((p) => p.city_id === selectedCityFilter)
		: periods

	// Группируем периоды по городам и сортируем по датам
	const groupedPeriods = filteredPeriods.reduce((acc, period) => {
		const cityId = period.city_id
		const cityName = period.city?.name || 'Неизвестный город'
		if (!acc[cityId]) {
			acc[cityId] = { cityName, periods: [] }
		}
		acc[cityId].periods.push(period)
		return acc
	}, {} as Record<string, { cityName: string; periods: SchedulePeriodWithCity[] }>)

	// Сортируем периоды в каждом городе по дате начала (ближайшие сначала)
	Object.values(groupedPeriods).forEach((group) => {
		group.periods.sort((a, b) => {
			return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
		})
	})

	if (loading) return <AdminPreloader />

	const totalPeriods = periods.length

	return (
		<div className="space-y-3">
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{/* Статистика и Форма */}
			<div className="bg-white rounded-xl border border-slate-200 p-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-ocean-50 rounded-xl flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
								{totalPeriods === 1
									? 'период расписания'
									: totalPeriods > 1 && totalPeriods < 5
										? 'периода расписания'
										: 'периодов расписания'}
							</p>
							<p className="text-xl sm:text-2xl font-regular text-slate-900">
								{totalPeriods}
							</p>
						</div>
					</div>

					{!showForm && (
						<button
							onClick={() => {
								setShowForm(true)
								setEditingPeriod(null)
							}}
							className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2.5 sm:py-3 h-10 rounded-lg bg-ocean-600 text-white text-sm font-normal hover:bg-ocean-700 transition-colors flex-shrink-0"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							Добавить период
						</button>
					)}
				</div>

				{/* Форма создания/редактирования */}
				{showForm && (
					<form onSubmit={handleSubmit} noValidate className="mt-4 pt-4 border-t border-slate-200">
						<div className="space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<CityDropdown
										cities={cities}
										value={formData.city_id}
										onChange={(value) =>
											setFormData({ ...formData, city_id: value })
										}
										label="Город "
										required={true}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Период работы <span className="text-red-500">*</span>
									</label>
									<div className="grid grid-cols-2 gap-2">
										<input
											type="date"
											value={formData.start_date}
											onChange={(e) =>
												setFormData({ ...formData, start_date: e.target.value })
											}
											className="text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											disabled={formLoading}
										/>
										<input
											type="date"
											value={formData.end_date}
											onChange={(e) =>
												setFormData({ ...formData, end_date: e.target.value })
											}
											className="text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											disabled={formLoading}
										/>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Время начала работы
									</label>
									<input
										type="time"
										value={formData.work_start_time.slice(0, 5)}
										onChange={(e) =>
											setFormData({
												...formData,
												work_start_time: e.target.value + ':00',
											})
										}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										disabled={formLoading}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										Время окончания работы
									</label>
									<input
										type="time"
										value={formData.work_end_time.slice(0, 5)}
										onChange={(e) =>
											setFormData({
												...formData,
												work_end_time: e.target.value + ':00',
											})
										}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										disabled={formLoading}
									/>
								</div>
							</div>

							<div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
								<button
									type="submit"
									disabled={formLoading || !isFormValid()}
									className="sm:flex-none bg-emerald-600 text-white text-sm font-regular px-4 py-2 h-10 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{formLoading
										? 'Сохранение...'
										: editingPeriod
											? 'Сохранить'
											: 'Создать период'}
								</button>
								<button
									type="button"
									onClick={resetForm}
									disabled={formLoading}
									className="sm:flex-none bg-slate-100 text-slate-700 text-sm font-regular px-4 py-2 h-10 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
								>
									Отмена
								</button>
							</div>
						</div>
					</form>
				)}
			</div>

			{/* Фильтр города */}
			<div className="bg-white rounded-xl border border-slate-200 p-4">
				<div className="flex flex-col gap-3">
					{/* Header row with filters label and results count */}
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
							</svg>
							<span className="text-sm font-medium text-slate-700">Фильтры:</span>
						</div>

						{/* Results count - always visible */}
						<div className="text-xs sm:text-sm text-slate-500 flex-shrink-0">
							<span className="font-medium text-slate-700">{filteredPeriods.length}</span> из <span className="font-medium text-slate-700">{periods.length}</span>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-2 lg:gap-2">
						{/* Filter by City */}
						<div className="w-full sm:w-[200px]">
							<CityDropdown
								cities={cities}
								value={selectedCityFilter}
								onChange={setSelectedCityFilter}
								label={undefined}
								required={false}
							/>
						</div>

						{/* Reset Filters */}
						{selectedCityFilter && (
							<button
								onClick={() => {
									setSelectedCityFilter('')
								}}
								className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
								Сбросить
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Список периодов */}
			<div className="space-y-3">
				{filteredPeriods.length === 0 ? (
					<div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-slate-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<p className="text-slate-500 text-md mb-3">
							Нет периодов расписания
						</p>
						<button
							onClick={() => setShowForm(true)}
							className="text-ocean-600 hover:text-ocean-700 text-md font-medium"
						>
							+ Создать первый период
						</button>
					</div>
				) : (
					Object.entries(groupedPeriods).map(([cityId, { cityName, periods: cityPeriods }]) => (
						<div key={cityId} className="space-y-2">
							{/* Заголовок города */}
							<h2 className="text-lg font-semibold text-slate-900 px-4 pt-2">
								{cityName}
							</h2>

							{/* Периоды города */}
							<div className="space-y-2">
								{cityPeriods.map((period) => {
									const isExpanded = expandedPeriodId === period.id
									const slots = periodSlots[period.id] || []
									const bookedCount = slots.filter((s) => s.is_booked).length

									return (
										<div
											key={period.id}
											className="bg-white rounded-xl border border-slate-200 overflow-hidden"
										>
											<button
												onClick={() => handleExpandPeriod(period.id)}
												className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
											>
												{/* Левая часть - информация о периоде */}
												<div className="flex-1 min-w-0">
													{/* Дата */}
													<p className="text-ьв text-slate-800 mb-1">
														{formatDateRange(period.start_date, period.end_date)}
													</p>

													{/* Часы работы */}
													<p className="text-sm text-slate-800 mb-2">
														Часы работы: {period.work_start_time.slice(0, 5)} -{' '}
														{period.work_end_time.slice(0, 5)}
													</p>

													{/* Информация о слотах при развёртывании */}
													{slots.length > 0 && (
														<p className="text-xs text-slate-500">
															Слотов: {slots.length} (забронировано: {bookedCount},
															свободно: {slots.length - bookedCount})
														</p>
													)}
												</div>

												{/* Кнопки справа - иконки */}
												<div className="flex items-center gap-1 flex-shrink-0">
													<button
														onClick={(e) => {
															e.stopPropagation()
															handleEdit(period)
														}}
														className="p-2 rounded-lg text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 transition-colors"
														title="Редактировать"
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation()
															handleDelete(period.id)
														}}
														className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
														title="Удалить"
													>
														<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>

													{/* Стрелка для раскрытия слотов */}
													<div className="w-5 h-5 flex items-center justify-center text-slate-400">
														<svg
															className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
														</svg>
													</div>
												</div>
											</button>

											{/* Развернутый список слотов */}
											{isExpanded && (
												<div className="border-t border-slate-200 p-3 bg-slate-50">
													{slots.length === 0 ? (
														<div className="text-center py-6">
															<div className="mb-2">
																<svg className="w-8 h-8 text-slate-400 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
																</svg>
															</div>
															<p className="text-sm text-slate-600 mb-1">Слоты генерируются...</p>
															<p className="text-xs text-slate-500">Это может занять несколько секунд</p>
														</div>
													) : (
														<div className="max-h-80 overflow-y-auto">
															<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
																{slots.map((slot) => (
																	<div
																		key={slot.id}
																		className={`p-2 rounded-lg text-xs text-center ${slot.is_booked
																			? 'bg-red-100 text-red-800 border border-red-200'
																			: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
																			}`}
																	>
																		<div className="font-medium mb-0.5">
																			{slot.slot_date}
																		</div>
																		<div className="text-[10px]">
																			{slot.start_time.slice(0, 5)} -{' '}
																			{slot.end_time.slice(0, 5)}
																		</div>
																	</div>
																))}
															</div>
														</div>
													)}
												</div>
											)}
										</div>
									)
								})}
							</div>
						</div>
					))
				)}
			</div>

			{/* Модальное окно подтверждения удаления */}
			<ConfirmDialog
				isOpen={!!deleteConfirmId}
				onClose={() => setDeleteConfirmId(null)}
				onConfirm={confirmDelete}
				title="Подтверждение удаления"
				description="Вы уверены, что хотите удалить этот период расписания? Это действие нельзя отменить."
				confirmText="Удалить"
				confirmLoading={deleteLoading}
			/>
		</div>
	)
}
