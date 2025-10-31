import { ReactNode, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const navigate = useNavigate()
	const location = useLocation()
	const { signOut, session } = useAdminAuth()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const handleLogout = async () => {
		const { error } = await signOut()
		if (!error) {
			navigate('/admin/login')
		}
	}

	const isActive = (path: string) => location.pathname === path

	return (
		<div className="relative min-h-screen font-sans bg-slate-50">
			{/* Mobile Menu Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside className={`fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
				}`}>
				{/* Logo in navigation */}
				<div className="px-4 py-3 border-b border-slate-200 h-16 flex items-center">
					<Link to="/" className="flex items-center gap-2 group">
						<div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
							<span className="text-white text-sm font-semibold">P</span>
						</div>
						<span className="text-slate-800 font-normal text-sm">P-DTR Admin</span>
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
					<Link
						to="/admin/services"
						onClick={() => setIsMobileMenuOpen(false)}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 ${isActive('/admin/services')
							? 'bg-ocean-50 text-ocean-700 shadow-sm'
							: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
							}`}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						<span>Услуги</span>
						{isActive('/admin/services') && (
							<div className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-600"></div>
						)}
					</Link>
					<Link
						to="/admin/schedule"
						onClick={() => setIsMobileMenuOpen(false)}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 ${isActive('/admin/schedule')
							? 'bg-ocean-50 text-ocean-700 shadow-sm'
							: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
							}`}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<span>Расписание</span>
						{isActive('/admin/schedule') && (
							<div className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-600"></div>
						)}
					</Link>
					<Link
						to="/admin/cases"
						onClick={() => setIsMobileMenuOpen(false)}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 ${isActive('/admin/cases')
							? 'bg-ocean-50 text-ocean-700 shadow-sm'
							: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
							}`}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<span>Кейсы</span>
						{isActive('/admin/cases') && (
							<div className="ml-auto w-1.5 h-1.5 rounded-full bg-ocean-600"></div>
						)}
					</Link>
					<Link
						to="/admin/categories"
						onClick={() => setIsMobileMenuOpen(false)}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 ${isActive('/admin/categories')
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
					<Link
						to="/admin/reviews"
						onClick={() => setIsMobileMenuOpen(false)}
						className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 ${isActive('/admin/reviews')
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
				</nav>

				{/* Logout button */}
				<div className="p-3 border-t border-slate-200">
					<button
						onClick={handleLogout}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-normal text-red-600 hover:bg-red-50 transition-colors duration-200"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Выйти
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<main className="lg:ml-64 min-h-screen bg-slate-50">
				{/* Unified Top bar */}
				<div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between w-full">
					{/* Mobile menu button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{isMobileMenuOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							)}
						</svg>
					</button>

					<h1 className="text-md font-normal text-slate-800 hidden lg:block">
						{isActive('/admin/reviews') && 'Модерация отзывов'}
						{isActive('/admin/categories') && 'Управление категориями'}
						{isActive('/admin/services') && 'Управление услугами'}
						{isActive('/admin/schedule') && 'Управление расписанием'}
						{isActive('/admin/cases') && 'Управление кейсами'}
					</h1>
					<div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
						<span>•</span>
						<span>{new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
					</div>
					<div className="flex items-center gap-2 lg:gap-3">
						<div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-full flex items-center justify-center text-white text-sm lg:text-md font-regular shadow-sm">
							{session?.user?.email?.[0].toUpperCase() || 'A'}
						</div>
						<div className="hidden lg:flex flex-col flex-1 min-w-0">
							<p className="text-sm font-medium text-slate-900 truncate">{session?.user?.email || 'Admin'}</p>
							<p className="text-xs text-slate-500">Администратор</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-2 sm:p-4 lg:p-4 flex justify-center">
					<div className="w-full max-w-[1100px]">
						{children}
					</div>
				</div>
			</main>
		</div>
	)
}
