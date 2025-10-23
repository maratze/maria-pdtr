import { useEffect, useState } from 'react'
import type {
	SchedulePeriodWithCity,
	City,
} from '../types/booking'
import {
	getSchedulePeriods,
	deleteSchedulePeriod,
	createSchedulePeriodsForDateRange,
	updateSchedulePeriod,
} from '../lib/schedule'
import { getCities } from '../lib/cities'
import { type OptimizedBooking } from '../lib/slots'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import ScheduleCalendar from '../components/ScheduleCalendar.tsx'
import CreatePeriodDialog from '../components/CreatePeriodDialog'
import EditPeriodDialog from '../components/EditPeriodDialog'

export default function AdminSchedule() {
	const [periods, setPeriods] = useState<SchedulePeriodWithCity[]>([])
	const [cities, setCities] = useState<City[]>([])
	const [bookings] = useState<OptimizedBooking[]>([]) // Новое состояние для бронирований
	const [loading, setLoading] = useState(true)
	const [selectedCityFilter, setSelectedCityFilter] = useState<string>('')
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [deleteMultipleIds, setDeleteMultipleIds] = useState<string[]>([])
	const [deleteMultipleLoading, setDeleteMultipleLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

	// Для создания периода на диапазон дат
	const [showCreatePeriodDialog, setShowCreatePeriodDialog] = useState(false)
	const [dateRangeForPeriod, setDateRangeForPeriod] = useState<{ start: string; end: string } | null>(null)
	const [createPeriodLoading, setCreatePeriodLoading] = useState(false)

	// Для редактирования периода
	const [showEditPeriodDialog, setShowEditPeriodDialog] = useState(false)
	const [editingPeriod, setEditingPeriod] = useState<SchedulePeriodWithCity | null>(null)
	const [editPeriodLoading, setEditPeriodLoading] = useState(false)

	useEffect(() => {
		loadInitialData()
	}, [])

	async function loadInitialData() {
		try {
			setLoading(true)
			const [periodsData, citiesData] = await Promise.all([
				getSchedulePeriods(),
				getCities(),
				// TODO: загрузить бронирования когда создадим API
			])
			setPeriods(periodsData)
			setCities(citiesData)
			// setBookings(bookingsData) // Пока пустой массив
		} catch (error) {
			console.error('Error loading data:', error)
			setToast({ message: 'Ошибка загрузки данных', type: 'error' })
		} finally {
			setLoading(false)
		}
	}


	function handleEdit(period: SchedulePeriodWithCity) {
		// Редактирование периода
		setEditingPeriod(period)
		setShowEditPeriodDialog(true)
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

	async function handleEditPeriodSubmit(periodId: string, cityId: string, startTime: string, endTime: string) {
		try {
			setEditPeriodLoading(true)
			await updateSchedulePeriod(periodId, {
				city_id: cityId,
				work_start_time: startTime,
				work_end_time: endTime,
			})

			// Обновляем список периодов
			const updatedPeriods = await getSchedulePeriods()
			setPeriods(updatedPeriods)

			setShowEditPeriodDialog(false)
			setEditingPeriod(null)
			setToast({
				message: 'Период обновлен',
				type: 'success'
			})
		} catch (error) {
			console.error('Error updating period:', error)
			setToast({
				message: error instanceof Error ? error.message : 'Ошибка обновления периода',
				type: 'error'
			})
		} finally {
			setEditPeriodLoading(false)
		}
	}

	const filteredPeriods = selectedCityFilter
		? periods.filter((p) => p.city_id === selectedCityFilter)
		: periods

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
				periods={filteredPeriods}
				bookings={bookings}
				cities={cities}
				selectedCityFilter={selectedCityFilter}
				onCityFilterChange={setSelectedCityFilter}
				onPeriodEdit={handleEdit}
				onPeriodDelete={handleDeletePeriod}
				onDeleteMultiplePeriods={handleDeleteMultiplePeriods}
				onCreatePeriodForRange={handleCreatePeriodForRange}
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

			{/* Модальное окно создания периода */}
			<CreatePeriodDialog
				isOpen={showCreatePeriodDialog}
				onClose={() => {
					setShowCreatePeriodDialog(false)
					setDateRangeForPeriod(null)
				}}
				onSubmit={handleCreatePeriodSubmit}
				startDate={dateRangeForPeriod?.start || null}
				endDate={dateRangeForPeriod?.end || null}
				isLoading={createPeriodLoading}
				cities={cities}
				existingPeriods={periods}
			/>

			{/* Модальное окно редактирования периода */}
			<EditPeriodDialog
				isOpen={showEditPeriodDialog}
				period={editingPeriod}
				cities={cities}
				periods={periods}
				onClose={() => {
					setShowEditPeriodDialog(false)
					setEditingPeriod(null)
				}}
				onSubmit={handleEditPeriodSubmit}
				isLoading={editPeriodLoading}
			/>
		</div>
	)
}
