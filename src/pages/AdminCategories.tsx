import { useEffect, useState } from 'react'
import { getCategories } from '../lib/reviews'
import type { Category } from '../types/review'

export default function AdminCategories() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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

	useEffect(() => {
		load()
	}, [])

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex items-center gap-3 text-slate-600">
					<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<span className="text-sm">Загрузка категорий...</span>
				</div>
			</div>
		)
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
		<div className="space-y-6">
			{/* Stats */}
			<div className="bg-white rounded-xl border border-slate-200 p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Всего категорий</p>
						<p className="text-2xl font-semibold text-slate-900 mt-1">{categories.length}</p>
					</div>
					<div className="w-12 h-12 bg-ocean-50 rounded-xl flex items-center justify-center">
						<svg className="w-6 h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
					</div>
				</div>
			</div>

			{/* Add button */}
			<button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ocean-600 text-white text-sm font-medium hover:bg-ocean-700 transition-colors shadow-sm">
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
				</svg>
				Добавить категорию
			</button>

			{/* Categories list */}
			{categories.length === 0 ? (
				<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
					<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
					</div>
					<h3 className="text-sm font-medium text-slate-900 mb-1">Нет категорий</h3>
					<p className="text-sm text-slate-500">Создайте первую категорию для отзывов</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
					{categories.map((category, index) => (
						<div key={category.id} className="p-4 hover:bg-slate-50 transition-colors">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="w-10 h-10 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-lg flex items-center justify-center flex-shrink-0">
										<span className="text-ocean-700 text-sm font-semibold">{index + 1}</span>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-sm font-semibold text-slate-900 truncate">{category.name}</h3>
										<p className="text-xs text-slate-500">ID: {category.id}</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button className="p-2 rounded-lg text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 transition-colors">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}