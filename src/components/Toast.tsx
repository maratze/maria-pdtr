import { useEffect } from 'react'

interface ToastProps {
	message: string
	type?: 'success' | 'error' | 'warning' | 'info'
	onClose: () => void
	duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 5000 }: ToastProps) {
	useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				onClose()
			}, duration)
			return () => clearTimeout(timer)
		}
	}, [duration, onClose])

	const styles = {
		success: {
			bg: 'bg-white',
			border: 'border-green-200',
			iconBg: 'bg-green-100',
			iconColor: 'text-green-600',
			titleColor: 'text-slate-900',
			icon: (
				<svg
					className="w-4 h-4 text-green-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
				</svg>
			)
		},
		error: {
			bg: 'bg-white',
			border: 'border-red-200',
			iconBg: 'bg-red-100',
			iconColor: 'text-red-600',
			titleColor: 'text-slate-900',
			icon: (
				<svg
					className="w-4 h-4 text-red-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			)
		},
		warning: {
			bg: 'bg-white',
			border: 'border-amber-200',
			iconBg: 'bg-amber-100',
			iconColor: 'text-amber-600',
			titleColor: 'text-slate-900',
			icon: (
				<svg
					className="w-4 h-4 text-amber-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			)
		},
		info: {
			bg: 'bg-white',
			border: 'border-blue-200',
			iconBg: 'bg-blue-100',
			iconColor: 'text-blue-600',
			titleColor: 'text-slate-900',
			icon: (
				<svg
					className="w-4 h-4 text-blue-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			)
		}
	}

	const style = styles[type]

	return (
		<div className="fixed top-4 right-4 z-50 animate-slide-in-right">
			<div className={`flex items-center gap-3 p-3 rounded-lg ${style.bg} shadow-lg border ${style.border} max-w-sm`}>
				<div className={`flex-shrink-0 w-6 h-6 ${style.iconBg} rounded-full flex items-center justify-center`}>
					{style.icon}
				</div>
				<div className="flex-1 text-left min-w-0">
					<p className={`text-sm font-regular ${style.titleColor} leading-tight`}>{message}</p>
				</div>
				<button
					onClick={onClose}
					className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	)
}
