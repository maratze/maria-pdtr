import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import AdminPreloader from './AdminPreloader'

interface PrivateRouteProps {
	children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
	const { session, loading } = useAdminAuth()

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-slate-50">
				<AdminPreloader message="Загрузка панели администратора..." />
			</div>
		)
	}

	if (!session) {
		return <Navigate to="/admin/login" replace />
	}

	return <>{children}</>
}
