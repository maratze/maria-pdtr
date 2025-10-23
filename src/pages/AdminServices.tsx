import { useEffect, useState } from 'react'
import { getServices, createService, updateService, deleteService } from '../lib/services'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'
import type { Service, ServiceInsert, DurationType } from '../types/service'

// Вспомогательная функция для форматирования длительности
function formatDuration(from: number, to: number, type: DurationType): string {
	if (type === 'none') return ''

	const value = from === to ? `${from}` : `${from} - ${to}`

	switch (type) {
		case 'minutes':
			return `${value} мин.`
		case 'hours':
			return `${value} ${from === 1 ? 'час' : from < 5 ? 'часа' : 'часов'}`
		case 'sessions':
			return `${value} ${from === 1 ? 'сеанс' : from < 5 ? 'сеанса' : 'сеансов'}`
		default:
			return ''
	}
}

// Вспомогательная функция для форматирования цены
function formatPrice(price: number, priceFrom: boolean): string {
	const formatted = price.toLocaleString('ru-RU')
	return priceFrom ? `от ${formatted} ₽` : `${formatted} ₽`
}

export default function AdminServices() {
	const [services, setServices] = useState<Service[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [formData, setFormData] = useState<ServiceInsert>({
		title: '',
		description: '',
		duration_from: 0,
		duration_to: 0,
		duration_type: 'minutes',
		price: 0,
		price_from: false
	})
	const [formLoading, setFormLoading] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editData, setEditData] = useState<ServiceInsert>({
		title: '',
		description: '',
		duration_from: 0,
		duration_to: 0,
		duration_type: 'minutes',
		price: 0,
		price_from: false
	})
	const [editLoading, setEditLoading] = useState(false)
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
	const [deleteConfirmName, setDeleteConfirmName] = useState('')
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		const { data, error } = await getServices()
		setLoading(false)

		if (error) {
			setError(error.message || 'Не удалось загрузить услуги')
			return
		}

		setServices(data || [])
	}

	async function handleAddService(e: React.FormEvent) {
		e.preventDefault()
		if (!formData.title.trim()) {
			setToast({ message: 'Введите название услуги', type: 'warning' })
			return
		}
		if (formData.price <= 0) {
			setToast({ message: 'Введите корректную стоимость услуги', type: 'warning' })
			return
		}

		setFormLoading(true)
		const result = await createService(formData)
		setFormLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно добавляем новую услугу в список с сортировкой
		if (result?.data && result.data.length > 0) {
			const updatedServices = [...services, result.data[0]]
			// Сортируем по display_order как в исходной загрузке
			updatedServices.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
			setServices(updatedServices)
		}

		setFormData({
			title: '',
			description: '',
			duration_from: 0,
			duration_to: 0,
			duration_type: 'minutes',
			price: 0,
			price_from: false
		})
		setShowForm(false)
		setToast({ message: 'Услуга создана', type: 'success' })
	}

	async function handleUpdateService(serviceId: string) {
		if (!editData.title.trim()) {
			setToast({ message: 'Введите название услуги', type: 'warning' })
			return
		}
		if (editData.price <= 0) {
			setToast({ message: 'Введите корректную стоимость услуги', type: 'warning' })
			return
		}

		setEditLoading(true)
		const result = await updateService(serviceId, editData)
		setEditLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно обновляем список вместо перезагрузки
		if (result?.data && result.data.length > 0) {
			setServices(services.map(srv =>
				srv.id === serviceId ? result.data![0] : srv
			))
		}
		setEditingId(null)
		setToast({ message: 'Услуга обновлена', type: 'success' })
	}

	async function handleDeleteService(serviceId: string) {
		setDeleteLoading(true)
		const result = await deleteService(serviceId)
		setDeleteLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно удаляем услугу из списка
		setServices(services.filter(srv => srv.id !== serviceId))
		setDeleteConfirmId(null)
		setDeleteConfirmName('')
		setToast({ message: 'Услуга удалена', type: 'success' })
	}

	useEffect(() => {
		load()
	}, [])

	if (loading) {
		return <AdminPreloader message="Загрузка услуг..." />
	}

	if (error) {
		return (
			<div className="rounded-xl bg-red-50 border border-red-200 p-4">
				<div className="flex items-center gap-2">
					<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span className="text-sm text-red-800">{error}</span>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="space-y-4">
				{/* Stats Card */}
				<div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-0">
						<div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-ocean-50 rounded-xl flex items-center justify-center flex-shrink-0">
								<svg className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Всего услуг</p>
								<p className="text-xl sm:text-2xl font-regular text-slate-900">{services.length}</p>
							</div>
						</div>

						{/* Add Button */}
						<button
							onClick={() => {
								setShowForm(!showForm)
								setEditingId(null)
							}}
							className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2.5 sm:py-3 h-10 rounded-lg bg-ocean-600 text-white text-sm font-normal hover:bg-ocean-700 transition-colors flex-shrink-0"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							{showForm ? 'Отмена' : 'Добавить услугу'}
						</button>
					</div>

					{/* Add Form */}
					{showForm && (
						<form onSubmit={handleAddService} className="mt-4 pt-4 border-t border-slate-200">
							<div className="space-y-3">
								<input
									type="text"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Название услуги"
									className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									autoFocus
								/>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Описание услуги"
									rows={3}
									className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
								/>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Тип длительности</label>
									<select
										value={formData.duration_type}
										onChange={(e) => setFormData({ ...formData, duration_type: e.target.value as DurationType })}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									>
										<option value="minutes">Минуты</option>
										<option value="hours">Часы</option>
										<option value="sessions">Сеансы</option>
										<option value="none">Без указания времени</option>
									</select>
								</div>
								{formData.duration_type !== 'none' && (
									<div className="grid grid-cols-2 gap-3">
										<input
											type="number"
											value={formData.duration_from || ''}
											onChange={(e) => setFormData({ ...formData, duration_from: parseInt(e.target.value) || 0 })}
											placeholder="От"
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										/>
										<input
											type="number"
											value={formData.duration_to || ''}
											onChange={(e) => setFormData({ ...formData, duration_to: parseInt(e.target.value) || 0 })}
											placeholder="До"
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										/>
									</div>
								)}
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Стоимость (₽)</label>
									<div className="flex gap-2">
										<input
											type="number"
											value={formData.price || ''}
											onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
											placeholder="10000"
											className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										/>
										<label className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
											<input
												type="checkbox"
												checked={formData.price_from}
												onChange={(e) => setFormData({ ...formData, price_from: e.target.checked })}
												className="rounded border-slate-300 text-ocean-600 focus:ring-ocean-500"
											/>
											<span className="text-sm text-slate-700">от</span>
										</label>
									</div>
								</div>
								<div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
									<button
										type="button"
										onClick={() => {
											setShowForm(false)
											setFormData({
												title: '',
												description: '',
												duration_from: 0,
												duration_to: 0,
												duration_type: 'minutes',
												price: 0,
												price_from: false
											})
										}}
										disabled={formLoading}
										className="flex-1 sm:flex-none px-3 py-2 h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-regular hover:bg-slate-200 transition-colors disabled:opacity-50"
									>
										Отмена
									</button>
									<button
										type="submit"
										disabled={formLoading}
										className="flex-1 sm:flex-none px-3 py-2 h-10 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 transition-colors"
									>
										{formLoading ? 'Добавление...' : 'Создать услугу'}
									</button>
								</div>
							</div>
						</form>
					)}
				</div>

				{/* Services list */}
				{services.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<h3 className="text-sm sm:text-md font-regular text-slate-900 mb-1">Нет услуг</h3>
						<p className="text-xs sm:text-sm text-slate-500">Создайте первую услугу</p>
					</div>
				) : (
					<div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
						{services.map((service, index) => (
							<div key={service.id} className={`p-3 sm:p-4 hover:bg-slate-50 transition-colors ${index === 0 ? 'rounded-t-[10px]' : ''
								} ${index === services.length - 1 ? 'rounded-b-[10px]' : ''}`}>
								{editingId === service.id ? (
									<div className="space-y-3">
										<input
											type="text"
											value={editData.title}
											onChange={(e) => setEditData({ ...editData, title: e.target.value })}
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											placeholder="Название услуги"
											autoFocus
										/>
										<textarea
											value={editData.description || ''}
											onChange={(e) => setEditData({ ...editData, description: e.target.value })}
											placeholder="Описание услуги"
											rows={3}
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										/>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Тип длительности</label>
											<select
												value={editData.duration_type}
												onChange={(e) => setEditData({ ...editData, duration_type: e.target.value as DurationType })}
												className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											>
												<option value="minutes">Минуты</option>
												<option value="hours">Часы</option>
												<option value="sessions">Сеансы</option>
												<option value="none">Без указания времени</option>
											</select>
										</div>
										{editData.duration_type !== 'none' && (
											<div className="grid grid-cols-2 gap-3">
												<input
													type="number"
													value={editData.duration_from || ''}
													onChange={(e) => setEditData({ ...editData, duration_from: parseInt(e.target.value) || 0 })}
													placeholder="От"
													className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
												/>
												<input
													type="number"
													value={editData.duration_to || ''}
													onChange={(e) => setEditData({ ...editData, duration_to: parseInt(e.target.value) || 0 })}
													placeholder="До"
													className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
												/>
											</div>
										)}
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Стоимость (₽)</label>
											<div className="flex gap-2">
												<input
													type="number"
													value={editData.price || ''}
													onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })}
													placeholder="10000"
													className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
												/>
												<label className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
													<input
														type="checkbox"
														checked={editData.price_from}
														onChange={(e) => setEditData({ ...editData, price_from: e.target.checked })}
														className="rounded border-slate-300 text-ocean-600 focus:ring-ocean-500"
													/>
													<span className="text-sm text-slate-700">от</span>
												</label>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleUpdateService(service.id)}
												disabled={editLoading}
												className="flex-1 sm:flex-none px-3 py-2 h-10 sm:w-24 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center"
											>
												{editLoading ? '...' : 'Сохранить'}
											</button>
											<button
												onClick={() => {
													setEditingId(null)
												}}
												className="flex-1 sm:flex-none px-3 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors"
											>
												Отмена
											</button>
										</div>
									</div>
								) : (
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1 min-w-0">
											<div className="flex items-start gap-2 sm:gap-3 mb-2">
												<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-lg flex items-center justify-center flex-shrink-0">
													<span className="text-ocean-700 text-sm sm:text-md font-regular">{index + 1}</span>
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="text-base font-normal text-slate-900 mb-1">{service.title}</h3>
													{service.description && (
														<p className="text-sm text-slate-600 mb-2">{service.description}</p>
													)}
													<div className="flex flex-wrap gap-2 text-xs text-slate-500">
														{service.duration_type !== 'none' && (
															<span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
																<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
																</svg>
																{formatDuration(service.duration_from, service.duration_to, service.duration_type)}
															</span>
														)}
														<span className="inline-flex items-center gap-1 bg-ocean-50 text-ocean-700 px-2 py-1 rounded font-medium">
															{formatPrice(service.price, service.price_from)}
														</span>
													</div>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-1 flex-shrink-0">
											<button
												onClick={() => {
													setEditingId(service.id)
													setEditData({
														title: service.title,
														description: service.description || '',
														duration_from: service.duration_from,
														duration_to: service.duration_to,
														duration_type: service.duration_type,
														price: service.price,
														price_from: service.price_from
													})
												}}
												className="p-2 rounded-lg text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 transition-colors"
												title="Редактировать"
											>
												<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
											<button
												onClick={() => {
													setDeleteConfirmId(service.id)
													setDeleteConfirmName(service.title)
												}}
												className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
												title="Удалить"
											>
												<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{deleteConfirmId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 !m-0" onClick={() => {
					setDeleteConfirmId(null)
					setDeleteConfirmName('')
				}}>
					<div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 sm:p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="text-sm sm:text-md font-medium text-slate-900">Удалить услугу?</h3>
								<p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">"{deleteConfirmName}"</p>
							</div>
						</div>
						<p className="text-xs sm:text-sm text-slate-600 mb-4">Это действие невозможно будет отменить</p>
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
							<button
								onClick={() => {
									setDeleteConfirmId(null)
									setDeleteConfirmName('')
								}}
								className="flex-1 px-4 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors order-2 sm:order-1"
							>
								Отмена
							</button>
							<button
								onClick={() => deleteConfirmId && handleDeleteService(deleteConfirmId)}
								disabled={deleteLoading}
								className="flex-1 px-4 py-2 h-10 rounded-lg bg-red-600 text-white text-sm font-regular hover:bg-red-700 disabled:opacity-50 transition-colors order-1 sm:order-2"
							>
								{deleteLoading ? '...' : 'Удалить'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Toast Notification */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</>
	)
}
