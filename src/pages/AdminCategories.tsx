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
		return <div className="p-4">Загрузка категорий...</div>
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="rounded bg-red-50 p-4 text-red-700">
					{error}
				</div>
			</div>
		)
	}

	return (
		<div>
			<h1 className="mb-6 text-3xl font-bold">Управление категориями</h1>

			<div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
				<div className="grid gap-4">
					{categories.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							Нет категорий
						</div>
					) : (
						categories.map((category) => (
							<div key={category.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
								<div>
									<h3 className="font-medium text-gray-900">{category.name}</h3>
									<p className="text-sm text-gray-500">ID: {category.id}</p>
								</div>
								<div className="flex gap-2">
									<button className="rounded px-3 py-1 text-sm bg-ocean-50 text-ocean-600 hover:bg-ocean-100 transition-colors">
										Редактировать
									</button>
									<button className="rounded px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
										Удалить
									</button>
								</div>
							</div>
						))
					)}
				</div>

				<button className="mt-6 w-full rounded-lg bg-ocean-600 px-4 py-2 text-white hover:bg-ocean-700 transition-colors font-medium">
					+ Добавить категорию
				</button>
			</div>
		</div>
	)
}
