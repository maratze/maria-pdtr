import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

export default function AdminLogin() {
	const navigate = useNavigate()
	const { signIn, loading: authLoading } = useAdminAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

		if (!email || !password) {
			setError('Пожалуйста, заполните все поля')
			setLoading(false)
			return
		}

		const { error } = await signIn(email, password)

		if (error) {
			setError(error.message || 'Ошибка входа. Проверьте email и пароль')
			setLoading(false)
			return
		}

		// Redirect to admin panel on success
		navigate('/admin/reviews')
	}

	if (authLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-100">
				<div className="text-lg text-gray-600">Загрузка...</div>
			</div>
		)
	}

	return (
		<div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
			<div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
				<div className="mb-6 text-center">
					<h1 className="text-3xl font-bold text-gray-800">Админ панель</h1>
					<p className="mt-2 text-sm text-gray-600">Вход для администраторов</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded bg-red-50 p-4 text-sm text-red-700 border border-red-200">
							{error}
						</div>
					)}

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
							placeholder="admin@example.com"
							className="w-full rounded border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Пароль
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							placeholder="••••••••"
							className="w-full rounded border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-orange-500 focus:outline-none disabled:bg-gray-100"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded bg-orange-600 px-4 py-2 text-white font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
					>
						{loading ? 'Вход...' : 'Войти'}
					</button>
				</form>

				<div className="mt-6 border-t border-gray-200 pt-4">
					<p className="text-xs text-gray-500 text-center">
						Это закрытая область. Доступ только для администраторов.
					</p>
				</div>
			</div>
		</div>
	)
}
