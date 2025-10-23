import { useEffect, useState } from 'react'
import { getCategories } from '../lib/reviews'
import AdminPreloader from '../components/AdminPreloader'
import Toast from '../components/Toast'
import { supabaseAdmin } from '../lib/supabaseClient'
import type { Category } from '../types/review'

export default function AdminCategories() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [newCategoryName, setNewCategoryName] = useState('')
	const [formLoading, setFormLoading] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editingName, setEditingName] = useState('')
	const [editLoading, setEditLoading] = useState(false)
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
	const [deleteConfirmName, setDeleteConfirmName] = useState('')
	const [deleteLoading, setDeleteLoading] = useState(false)
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null)

	async function load() {
		setLoading(true)
		setError(null)
		const { data, error } = await getCategories()
		setLoading(false)

		if (error) {
			setError(error.message || 'Не удалось загрузить категории')
			return
		}

		setCategories(data || [])
	}

	async function handleAddCategory(e: React.FormEvent) {
		e.preventDefault()
		if (!newCategoryName.trim()) {
			setToast({ message: 'Введите название категории', type: 'warning' })
			return
		}

		setFormLoading(true)
		const result = await supabaseAdmin
			?.from('categories')
			.insert([{ name: newCategoryName }] as any)
			.select()

		setFormLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно добавляем новую категорию в список с сортировкой
		if (result?.data && result.data.length > 0) {
			const updatedCategories = [...categories, result.data[0]]
			// Сортируем по display_order как в исходной загрузке
			updatedCategories.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
			setCategories(updatedCategories)
		}

		setNewCategoryName('')
		setShowForm(false)
		setToast({ message: 'Категория создана', type: 'success' })
	}

	async function handleUpdateCategory(categoryId: string) {
		if (!editingName.trim()) {
			setToast({ message: 'Введите название категории', type: 'warning' })
			return
		}

		setEditLoading(true)
		const result = await supabaseAdmin
			?.from('categories')
			.update({ name: editingName } as never)
			.eq('id', categoryId)

		setEditLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно обновляем список вместо перезагрузки
		setCategories(categories.map(cat =>
			cat.id === categoryId ? { ...cat, name: editingName } : cat
		))
		setEditingId(null)
		setEditingName('')
		setToast({ message: 'Категория обновлена', type: 'success' })
	}

	async function handleDeleteCategory(categoryId: string) {
		setDeleteLoading(true)
		const result = await supabaseAdmin
			?.from('categories')
			.delete()
			.eq('id', categoryId)

		setDeleteLoading(false)

		if (result?.error) {
			setToast({ message: result.error.message, type: 'error' })
			return
		}

		// Реактивно удаляем категорию из списка
		setCategories(categories.filter(cat => cat.id !== categoryId))
		setDeleteConfirmId(null)
		setDeleteConfirmName('')
		setToast({ message: 'Категория удалена', type: 'success' })
	}

	useEffect(() => {
		load()
	}, [])

	if (loading) {
		return <AdminPreloader message="Загрузка категорий..." />
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
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Всего категорий</p>
								<p className="text-xl sm:text-2xl font-regular text-slate-900">{categories.length}</p>
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
							{showForm ? 'Отмена' : 'Добавить категорию'}
						</button>
					</div>

					{/* Add Form */}
					{showForm && (
						<form onSubmit={handleAddCategory} className="mt-4 pt-4 border-t border-slate-200">
							<div className="space-y-3">
								<input
									type="text"
									value={newCategoryName}
									onChange={(e) => setNewCategoryName(e.target.value)}
									placeholder="Введите название категории"
									className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
									autoFocus
								/>
								<div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
									<button
										type="button"
										onClick={() => {
											setShowForm(false)
											setNewCategoryName('')
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
										{formLoading ? 'Добавление...' : 'Создать'}
									</button>
								</div>
							</div>
						</form>
					)}
				</div>

				{/* Categories list */}
				{categories.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
						</div>
						<h3 className="text-sm sm:text-md font-regular text-slate-900 mb-1">Нет категорий</h3>
						<p className="text-xs sm:text-sm text-slate-500">Создайте первую категорию для отзывов</p>
					</div>
				) : (
					<div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
						{categories.map((category, index) => (
							<div key={category.id} className={`p-3 sm:p-4 hover:bg-slate-50 transition-colors ${index === 0 ? 'rounded-t-[10px]' : ''
								} ${index === categories.length - 1 ? 'rounded-b-[10px]' : ''}`}>
								{editingId === category.id ? (
									<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
										<input
											type="text"
											value={editingName}
											onChange={(e) => setEditingName(e.target.value)}
											className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											autoFocus
										/>
										<div className="flex items-center gap-2">
											<button
												onClick={() => handleUpdateCategory(category.id)}
												disabled={editLoading}
												className="flex-1 sm:flex-none px-3 py-2 h-10 sm:w-24 rounded-lg bg-emerald-600 text-white text-sm font-regular hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center"
											>
												{editLoading ? '...' : 'Сохранить'}
											</button>
											<button
												onClick={() => {
													setEditingId(null)
													setEditingName('')
												}}
												className="flex-1 sm:flex-none px-3 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors"
											>
												Отмена
											</button>
										</div>
									</div>
								) : (
									<div className="flex items-center justify-between gap-3">
										<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
											<div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-lg flex items-center justify-center flex-shrink-0">
												<span className="text-ocean-700 text-sm sm:text-md font-regular">{index + 1}</span>
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="text-base font-normal text-slate-900">{category.name}</h3>
												<p className="text-xs text-slate-600">ID: {category.id}</p>
											</div>
										</div>
										<div className="flex items-center gap-1">
											<button
												onClick={() => {
													setEditingId(category.id)
													setEditingName(category.name)
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
													setDeleteConfirmId(category.id)
													setDeleteConfirmName(category.name)
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
			</div>			{/* Delete Confirmation Modal */}
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
								<h3 className="text-sm sm:text-md font-medium text-slate-900">Удалить категорию?</h3>
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
								onClick={() => deleteConfirmId && handleDeleteCategory(deleteConfirmId)}
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