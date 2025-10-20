import { ReactNode } from 'react'

interface AuthLayoutProps {
	children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="min-h-screen font-sans text-slate-800">
			{children}
		</div>
	)
}
