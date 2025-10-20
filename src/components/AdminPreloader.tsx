interface AdminPreloaderProps {
	message?: string
}

export default function AdminPreloader({ message = 'Загрузка...' }: AdminPreloaderProps) {
	return (
		<div className="flex items-center justify-center py-12">
			<div className="text-center">
				{/* Animated Spinner */}
				<div className="inline-flex items-center justify-center mb-4">
					<div className="relative w-16 h-16">
						{/* Outer ring */}
						<div className="absolute inset-0 border-4 border-transparent border-t-ocean-600 border-r-ocean-600/50 rounded-full animate-spin"></div>

						{/* Inner ring - counter-rotating */}
						<div className="absolute inset-2 border-3 border-transparent border-b-ocean-400/70 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
					</div>
				</div>

				{/* Message */}
				<p className="text-sm font-medium text-slate-600">{message}</p>
			</div>
		</div>
	)
}
