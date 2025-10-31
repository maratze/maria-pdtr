import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import Logo from '../components/Logo'

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
		navigate('/admin/schedule')
	}

	if (authLoading) {
		return (
			<div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900 overflow-hidden flex items-center justify-center">
				<div className="text-lg text-slate-300">Загрузка...</div>
			</div>
		)
	}

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900 overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
			{/* Animated background from Hero */}
			<div className="absolute inset-0">
				{/* Main gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-ocean-600/20 via-transparent to-slate-800/30"></div>

				{/* Static circles */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ocean-400/10 rounded-full blur-3xl"></div>
				<div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>

				{/* Dot grid */}
				<div className="absolute inset-0 opacity-30">
					<div
						className="w-full h-full"
						style={{
							backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
							backgroundSize: '50px 50px'
						}}
					></div>
				</div>
			</div>

			<div className="max-w-md w-full relative z-10">
				{/* Logo */}
				<div className="flex justify-center flex-col mb-6 sm:mb-8">
					<Logo className="w-full !gap-0" />
				</div>

				<div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 shadow-2xl">
					<form onSubmit={handleSubmit} className="space-y-5">
						{error && (
							<div className="rounded-lg bg-red-500/20 p-4 text-sm text-red-200 border border-red-500/30 backdrop-blur-sm">
								{error}
							</div>
						)}

						<div>
							<label htmlFor="email" className="block text-sm font-light text-slate-200 mb-2">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
								placeholder="your@email.com"
								className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:border-ocean-300 focus:outline-none focus:ring-1 focus:ring-ocean-300/50 disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-light text-slate-200 mb-2">
								Пароль
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={loading}
								placeholder="••••••••"
								className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-400 focus:border-ocean-300 focus:outline-none focus:ring-1 focus:ring-ocean-300/50 disabled:opacity-50 backdrop-blur-sm transition-all duration-300"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full mt-6 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-6 py-3 rounded-lg hover:bg-ocean-500 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 font-light transform hover:scale-[1.02]"
						>
							{loading ? 'Вход...' : 'Войти'}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}