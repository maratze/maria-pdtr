interface AdminPreloaderProps {
	message?: string
}

export default function AdminPreloader({ message = 'Загрузка...' }: AdminPreloaderProps) {
	return (
		<div className="flex items-center justify-center py-12">
			<div className="text-center">
				{/* Animated Spinner - Enhanced */}
				<div className="inline-flex items-center justify-center mb-4">
					<div className="relative w-12 h-12">
						{/* Outer spinning ring */}
						<div className="absolute inset-0 border-4 border-slate-200 border-t-ocean-600 border-r-ocean-600/50 rounded-full animate-spin"></div>

						{/* Inner counter-rotating ring */}
						<div className="absolute inset-3 border-3 border-transparent border-b-ocean-400 border-l-ocean-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
					</div>
				</div>

				{/* Message */}
				<p className="text-sm font-medium text-slate-600">{message}</p>
			</div>
		</div>
	)
}
