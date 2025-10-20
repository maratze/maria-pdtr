import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import Logo from '../components/Logo'

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const navigate = useNavigate()
	const { signOut } = useAdminAuth()

	const handleLogout = async () => {
		const { error } = await signOut()
		if (!error) {
			navigate('/admin/login')
		}
	}

	return (
		<div className="min-h-screen font-sans text-slate-800 bg-gray-50">
			{/* Header */}
			<header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<Logo className="!text-lg" />
						<button
							onClick={handleLogout}
							className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors duration-300"
						>
							Выход
						</button>
					</div>
				</div>
			</header>

			{/* Sidebar + Content */}
			<div className="flex min-h-[calc(100vh-73px)]">
				{/* Sidebar */}
				<aside className="w-64 border-r border-gray-200 bg-white p-6">
					<nav className="space-y-4">
						<div>
							<h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
								Управление
							</h3>
							<div className="space-y-2">
								<Link
									to="/admin/reviews"
									className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-colors duration-300"
								>
									📝 Отзывы
								</Link>
								<Link
									to="/admin/categories"
									className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-colors duration-300"
								>
									🏷️ Категории
								</Link>
							</div>
						</div>
					</nav>
				</aside>

				{/* Main Content */}
				<main className="flex-1 p-6">
					{children}
				</main>
			</div>
		</div>
	)
}
