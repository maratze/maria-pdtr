import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

interface PrivateRouteProps {
	children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
	const { session, loading } = useAdminAuth()

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-100">
				<div className="text-lg text-gray-600">Загрузка...</div>
			</div>
		)
	}

	if (!session) {
		return <Navigate to="/admin/login" replace />
	}

	return <>{children}</>
}
