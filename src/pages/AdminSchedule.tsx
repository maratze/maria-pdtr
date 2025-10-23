import { useEffect, useState } from 'react'
import type {
	SchedulePeriodWithCity,
	City,
	TimeSlot,
} from '../types/booking'
import {
	getSchedulePeriods,
	deleteSchedulePeriod,
	createSchedulePeriodsForDateRange,
} from '../lib/schedule'
import { getCities } from '../lib/cities'
import { getTimeSlotsByPeriod } from '../lib/timeSlots'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import ScheduleCalendar from '../components/ScheduleCalendar'
import SlotDetailsDialog from '../components/SlotDetailsDialog'
import CreatePeriodDialog from '../components/CreatePeriodDialog'

export default function AdminSchedule() {
	const [periods, setPeriods] = useState<SchedulePeriodWithCity[]>([])
	const [cities, setCities] = useState<City[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCityFilter, setSelectedCityFilter] = useState<string>('')
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [deleteMultipleIds, setDeleteMultipleIds] = useState<string[]>([])
	const [deleteMultipleLoading, setDeleteMultipleLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

	// Для отображения календаря
	const [periodSlots, setPeriodSlots] = useState<Record<string, TimeSlot[]>>({})
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
	const [showSlotDetails, setShowSlotDetails] = useState(false)

	// Для создания периода на диапазон дат
	const [showCreatePeriodDialog, setShowCreatePeriodDialog] = useState(false)
	const [dateRangeForPeriod, setDateRangeForPeriod] = useState<{ start: string; end: string } | null>(null)
	const [createPeriodLoading, setCreatePeriodLoading] = useState(false)

	useEffect(() => {
		loadInitialData()
	}, [])

	async function loadInitialData() {
		try {
			setLoading(true)
			const [periodsData, citiesData] = await Promise.all([
				getSchedulePeriods(),
				getCities(),
			])
			setPeriods(periodsData)
			setCities(citiesData)
			// Загружаем слоты для всех периодов
			if (periodsData.length > 0) {
				await Promise.all(
					periodsData.map(period => loadPeriodSlots(period.id))
				)
			}
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

	function handleEdit(period: SchedulePeriodWithCity) {
		// Редактирование - будет обработано в модальном окне календаря
		console.log('Edit period:', period)
	}

	async function handleDeletePeriod(id: string) {
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

	async function handleDeleteMultiplePeriods(periodIds: string[]) {
		if (periodIds.length === 0) return
		setDeleteMultipleIds(periodIds)
	}

	async function confirmDeleteMultiple() {
		if (deleteMultipleIds.length === 0) return

		try {
			setDeleteMultipleLoading(true)
			// Удаляем все периоды
			await Promise.all(deleteMultipleIds.map(id => deleteSchedulePeriod(id)))
			// Обновляем список
			const idsToDelete = [...deleteMultipleIds]
			setPeriods(periods.filter(p => !idsToDelete.includes(p.id)))
			setToast({ message: `Удалено ${idsToDelete.length} периодов`, type: 'success' })
			setDeleteMultipleIds([])
		} catch (error) {
			console.error('Error deleting periods:', error)
			setToast({ message: 'Ошибка удаления периодов', type: 'error' })
		} finally {
			setDeleteMultipleLoading(false)
		}
	}

	async function handleCreatePeriodForRange(startDate: string, endDate: string) {
		setDateRangeForPeriod({ start: startDate, end: endDate })
		setShowCreatePeriodDialog(true)
	}

	async function handleCreatePeriodSubmit(cityId: string, startTime: string, endTime: string) {
		if (!dateRangeForPeriod) return

		try {
			setCreatePeriodLoading(true)
			const newPeriods = await createSchedulePeriodsForDateRange(
				dateRangeForPeriod.start,
				dateRangeForPeriod.end,
				cityId,
				startTime,
				endTime
			)

			// Обновляем список периодов
			const updatedPeriods = await getSchedulePeriods()
			setPeriods(updatedPeriods)

			// Загружаем слоты для новых периодов
			await Promise.all(
				newPeriods.map(period => loadPeriodSlots(period.id))
			)

			setShowCreatePeriodDialog(false)
			setDateRangeForPeriod(null)
			setToast({
				message: `Создано ${newPeriods.length} периодов расписания`,
				type: 'success'
			})
		} catch (error) {
			console.error('Error creating periods:', error)
			setToast({
				message: error instanceof Error ? error.message : 'Ошибка создания периодов',
				type: 'error'
			})
		} finally {
			setCreatePeriodLoading(false)
		}
	}

	const filteredPeriods = selectedCityFilter
		? periods.filter((p) => p.city_id === selectedCityFilter)
		: periods

	// Собираем все слоты из отфильтрованных периодов
	const allSlots: (TimeSlot & { period: SchedulePeriodWithCity })[] = []
	filteredPeriods.forEach(period => {
		const slots = periodSlots[period.id] || []
		slots.forEach(slot => {
			allSlots.push({ ...slot, period })
		})
	})

	if (loading) return <AdminPreloader />

	return (
		<div className="space-y-3">
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{/* Календарь со всеми периодами */}
			<ScheduleCalendar
				slots={allSlots}
				periods={filteredPeriods}
				cities={cities}
				selectedCityFilter={selectedCityFilter}
				onCityFilterChange={setSelectedCityFilter}
				onSlotClick={(slot: TimeSlot) => {
					setSelectedSlot(slot)
					setShowSlotDetails(true)
				}}
				onPeriodEdit={handleEdit}
				onPeriodDelete={handleDeletePeriod}
				onDeleteMultiplePeriods={handleDeleteMultiplePeriods}
				onCreatePeriodForRange={handleCreatePeriodForRange}
			/>

			{/* Модальное окно с информацией о слоте */}
			<SlotDetailsDialog
				isOpen={showSlotDetails}
				slot={selectedSlot}
				onClose={() => {
					setShowSlotDetails(false)
					setSelectedSlot(null)
				}}
			/>

			{/* Диалог создания периода на диапазон дат */}
			<CreatePeriodDialog
				isOpen={showCreatePeriodDialog}
				startDate={dateRangeForPeriod?.start ?? null}
				endDate={dateRangeForPeriod?.end ?? null}
				cities={cities}
				existingPeriods={periods}
				onClose={() => {
					setShowCreatePeriodDialog(false)
					setDateRangeForPeriod(null)
				}}
				onSubmit={handleCreatePeriodSubmit}
				isLoading={createPeriodLoading}
			/>

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

			{/* Модальное окно подтверждения удаления нескольких периодов */}
			<ConfirmDialog
				isOpen={deleteMultipleIds.length > 0}
				onClose={() => setDeleteMultipleIds([])}
				onConfirm={confirmDeleteMultiple}
				title="Подтверждение удаления"
				description={`Вы уверены, что хотите удалить ${deleteMultipleIds.length} период${deleteMultipleIds.length === 1 ? '' : deleteMultipleIds.length < 5 ? 'а' : 'ов'}? Это действие нельзя отменить.`}
				confirmText="Удалить"
				confirmLoading={deleteMultipleLoading}
				variant="danger"
			/>
		</div>
	)
}
