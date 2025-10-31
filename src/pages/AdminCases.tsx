import { useEffect, useState } from 'react'
import { listAllCases, createCase, updateCase, deleteCase } from '../lib/cases'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Case, CaseInsert } from '../types/case'

export default function AdminCases() {
	const [cases, setCases] = useState<Case[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [formData, setFormData] = useState<CaseInsert>({
		title: '',
		problem: '',
		solution: '',
		result: '',
		duration: ''
	})
	const [formLoading, setFormLoading] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editData, setEditData] = useState<CaseInsert>({
		title: '',
		problem: '',
		solution: '',
		result: '',
		duration: ''
	})
	const [editLoading, setEditLoading] = useState(false)
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
	const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('')
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

	// Функции проверки валидности форм
	const isAddFormValid = () => {
		return formData.title.trim() && formData.problem.trim() && formData.solution.trim() && formData.result.trim() && formData.duration.trim()
	}

	const isEditFormValid = () => {
		return editData.title.trim() && editData.problem.trim() && editData.solution.trim() && editData.result.trim() && editData.duration.trim()
	}

	async function load() {
		setLoading(true)
		setError(null)
		const { data, error } = await listAllCases()
		setLoading(false)

		if (error) {
			setError(error.message || 'Не удалось загрузить кейсы')
			return
		}

		setCases(data || [])
	}

	async function handleAddCase(e: React.FormEvent) {
		e.preventDefault()

		if (!isAddFormValid()) {
			return
		}

		setFormLoading(true)
		const result = await createCase(formData)
		setFormLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно добавляем новый кейс в список с сортировкой
		if (result?.data && result.data.length > 0) {
			const updatedCases = [...cases, result.data[0]]
			updatedCases.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
			setCases(updatedCases)
		}

		setFormData({
			title: '',
			problem: '',
			solution: '',
			result: '',
			duration: ''
		})
		setShowForm(false)
		setToast({ message: 'Кейс создан', type: 'success' })
	}

	async function handleUpdateCase(caseId: string) {
		if (!isEditFormValid()) {
			return
		}

		setEditLoading(true)
		const result = await updateCase(caseId, editData)
		setEditLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно обновляем список вместо перезагрузки
		if (result?.data && result.data.length > 0) {
			setCases(cases.map(c =>
				c.id === caseId ? result.data![0] : c
			))
		}
		setEditingId(null)
		setToast({ message: 'Кейс обновлён', type: 'success' })
	}

	async function handleDeleteCase(caseId: string) {
		setDeleteLoading(true)
		const result = await deleteCase(caseId)
		setDeleteLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно удаляем кейс из списка
		setCases(cases.filter(c => c.id !== caseId))
		setDeleteConfirmId(null)
		setDeleteConfirmTitle('')
		setToast({ message: 'Кейс удалён', type: 'success' })
	}

	useEffect(() => {
		load()
	}, [])

	if (loading) {
		return <AdminPreloader message="Загрузка кейсов..." />
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
			<div className="space-y-3">
				{/* Stats Card */}
				<div className="bg-white rounded-xl border border-slate-200 p-4">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-ocean-50 rounded-xl flex items-center justify-center flex-shrink-0">
								<svg className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Всего кейсов</p>
								<p className="text-xl sm:text-2xl font-regular text-slate-900">{cases.length}</p>
							</div>
						</div>

						{/* Add Button */}
						{!showForm && (
							<button
								onClick={() => {
									setShowForm(true)
									setEditingId(null)
								}}
								className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2.5 sm:py-3 h-10 rounded-lg bg-ocean-600 text-white text-sm font-normal hover:bg-ocean-700 transition-colors flex-shrink-0"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
								Добавить кейс
							</button>
						)}
					</div>

					{/* Add Form */}
					{showForm && (
						<form onSubmit={handleAddCase} noValidate className="mt-4 pt-4 border-t border-slate-200">
							<div className="space-y-3">
								<input
									type="text"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Заголовок кейса"
									className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									autoFocus
								/>
								<input
									type="text"
									value={formData.duration}
									onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
									placeholder="Длительность (например: 6 сеансов)"
									className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
								/>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Проблема</label>
									<textarea
										value={formData.problem}
										onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
										placeholder="Описание проблемы пациента (HTML поддерживается)"
										rows={4}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Решение</label>
									<textarea
										value={formData.solution}
										onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
										placeholder="Описание решения (HTML поддерживается)"
										rows={4}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Результат</label>
									<textarea
										value={formData.result}
										onChange={(e) => setFormData({ ...formData, result: e.target.value })}
										placeholder="Описание результата (HTML поддерживается)"
										rows={4}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									/>
								</div>
								<div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
									<button
										type="submit"
										disabled={formLoading || !isAddFormValid()}
										className="sm:flex-none px-3 py-2 h-10 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{formLoading ? 'Добавление...' : 'Создать кейс'}
									</button>
									<button
										type="button"
										onClick={() => {
											setShowForm(false)
											setFormData({
												title: '',
												problem: '',
												solution: '',
												result: '',
												duration: ''
											})
										}}
										disabled={formLoading}
										className="sm:flex-none px-3 py-2 h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-regular hover:bg-slate-200 transition-colors disabled:opacity-50"
									>
										Отмена
									</button>
								</div>
							</div>
						</form>
					)}
				</div>

				{/* Cases list */}
				{cases.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h3 className="text-sm sm:text-md font-regular text-slate-900 mb-1">Нет кейсов</h3>
						<p className="text-xs sm:text-sm text-slate-500">Создайте первый кейс</p>
					</div>
				) : (
					<div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
						{cases.map((caseItem, index) => (
							<div key={caseItem.id} className={`p-3 sm:p-4 hover:bg-slate-50 transition-colors ${index === 0 ? 'rounded-t-[10px]' : ''
								} ${index === cases.length - 1 ? 'rounded-b-[10px]' : ''}`}>
								{editingId === caseItem.id ? (
									<div className="space-y-3">
										<input
											type="text"
											value={editData.title}
											onChange={(e) => setEditData({ ...editData, title: e.target.value })}
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											placeholder="Заголовок кейса"
											autoFocus
										/>
										<input
											type="text"
											value={editData.duration}
											onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
											placeholder="Длительность (например: 6 сеансов)"
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										/>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Проблема</label>
											<textarea
												value={editData.problem}
												onChange={(e) => setEditData({ ...editData, problem: e.target.value })}
												placeholder="Описание проблемы пациента (HTML поддерживается)"
												rows={4}
												className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Решение</label>
											<textarea
												value={editData.solution}
												onChange={(e) => setEditData({ ...editData, solution: e.target.value })}
												placeholder="Описание решения (HTML поддерживается)"
												rows={4}
												className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Результат</label>
											<textarea
												value={editData.result}
												onChange={(e) => setEditData({ ...editData, result: e.target.value })}
												placeholder="Описание результата (HTML поддерживается)"
												rows={4}
												className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											/>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleUpdateCase(caseItem.id)}
												disabled={editLoading || !isEditFormValid()}
												className="sm:flex-none px-3 py-2 h-10 sm:w-24 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
											>
												{editLoading ? '...' : 'Сохранить'}
											</button>
											<button
												onClick={() => setEditingId(null)}
												disabled={editLoading}
												className="sm:flex-none px-3 py-2 h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-regular hover:bg-slate-200 transition-colors disabled:opacity-50"
											>
												Отмена
											</button>
										</div>
									</div>
								) : (
									<>
										<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
											<div className="flex-1 min-w-0">
												<h3 className="text-md font-medium text-slate-900 mb-1 break-words">{caseItem.title}</h3>
												<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
													<span className="flex items-center gap-1">
														<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														{caseItem.duration}
													</span>
													<span>•</span>
													<span>{new Date(caseItem.created_at).toLocaleDateString('ru-RU')}</span>
												</div>
												<div className="space-y-2">
													<div>
														<p className="text-xs font-medium text-red-600 uppercase mb-1">Проблема:</p>
														<p className="text-sm text-slate-600 line-clamp-2"
															dangerouslySetInnerHTML={{ __html: caseItem.problem }}
														/>
													</div>
													<div>
														<p className="text-xs font-medium text-ocean-600 uppercase mb-1">Решение:</p>
														<p className="text-sm text-slate-600 line-clamp-2"
															dangerouslySetInnerHTML={{ __html: caseItem.solution }}
														/>
													</div>
													<div>
														<p className="text-xs font-medium text-green-600 uppercase mb-1">Результат:</p>
														<p className="text-sm text-slate-600 line-clamp-2"
															dangerouslySetInnerHTML={{ __html: caseItem.result }}
														/>
													</div>
												</div>
											</div>
											<div className="flex sm:flex-col gap-2 flex-shrink-0">
												<button
													onClick={() => {
														setEditingId(caseItem.id)
														setEditData({
															title: caseItem.title,
															problem: caseItem.problem,
															solution: caseItem.solution,
															result: caseItem.result,
															duration: caseItem.duration
														})
														setShowForm(false)
													}}
													className="flex-1 sm:flex-none p-2 h-9 w-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center"
													title="Редактировать"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => {
														setDeleteConfirmId(caseItem.id)
														setDeleteConfirmTitle(caseItem.title)
													}}
													className="flex-1 sm:flex-none p-2 h-9 w-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center"
													title="Удалить"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Toast */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			{deleteConfirmId && (
				<ConfirmDialog
					isOpen={true}
					title="Удалить кейс?"
					itemName={deleteConfirmTitle}
					description="Это действие нельзя отменить."
					confirmText="Удалить"
					onConfirm={() => handleDeleteCase(deleteConfirmId)}
					onClose={() => {
						setDeleteConfirmId(null)
						setDeleteConfirmTitle('')
					}}
					confirmLoading={deleteLoading}
					variant="danger"
				/>
			)}
		</>
	)
}
