import { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const { signOut, session } = useAdminAuth()

	const handleLogout = async () => {
		const { error } = await signOut()
		if (!error) {
			navigate('/admin/login')
		}
	}

	const isActive = (path: string) => location.pathname === path

	return (
		<div className="relative min-h-screen font-sans bg-slate-50">
			{/* Sidebar */}
			<aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-20">
				{/* Logo */}
				<div className="h-16 flex items-center px-6 border-b border-slate-200">
					<Link to="/" className="flex items-center gap-2 group">
						<div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
							<span className="text-white text-sm font-semibold">P</span>
						</div>
						<span className="text-slate-900 font-medium text-sm">P-DTR Admin</span>
					</Link>
				</div>

				{/* User info */}
				<div className="px-4 py-4 border-b border-slate-200">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
							{session?.user?.email?.[0].toUpperCase() || 'A'}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium text-slate-900 truncate">{session?.user?.email || 'Admin'}</p>
							<p className="text-xs text-slate-500">Администратор</p>
						</div>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
					<Link
						to="/admin/reviews"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/reviews')
								? 'bg-ocean-50 text-ocean-700 shadow-sm'
								: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
							}`}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
						</svg>
						<span>Отзывы</span>
						{isActive('/admin/reviews') && (
							<div className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-600"></div>
						)}
					</Link>
					<Link
						to="/admin/categories"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin/categories')
								? 'bg-ocean-50 text-ocean-700 shadow-sm'
								: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
							}`}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
						<span>Категории</span>
						{isActive('/admin/categories') && (
							<div className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-600"></div>
						)}
					</Link>
				</nav>

				{/* Logout button */}
				<div className="p-4 border-t border-slate-200">
					<button
						onClick={handleLogout}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Выйти
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="ml-64 min-h-screen bg-slate-50">
				{/* Top bar */}
				<div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<h1 className="text-lg font-semibold text-slate-900">
								{isActive('/admin/reviews') && 'Модерация отзывов'}
								{isActive('/admin/categories') && 'Управление категориями'}
							</h1>
						</div>
						<div className="flex items-center gap-2 text-xs text-slate-500">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-8">
					{children}
				</div>
			</main>
		</div>
	)
}
