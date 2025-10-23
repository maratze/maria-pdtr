interface ConfirmDialogProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	description?: string
	itemName?: string
	confirmText?: string
	confirmLoading?: boolean
	variant?: 'danger' | 'warning'
}

export default function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	itemName,
	confirmText = 'Удалить',
	confirmLoading = false,
	variant = 'danger'
}: ConfirmDialogProps) {
	if (!isOpen) return null

	const iconColor = variant === 'danger' ? 'text-red-600' : 'text-amber-600'
	const iconBg = variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'
	const buttonColor = variant === 'danger'
		? 'bg-red-600 hover:bg-red-700'
		: 'bg-amber-600 hover:bg-amber-700'

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 !m-0"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 sm:p-6 max-w-sm w-full"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-3 mb-4">
					<div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
						<svg className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm sm:text-base font-medium text-slate-900">{title}</h3>
						{itemName && (
							<p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">"{itemName}"</p>
						)}
					</div>
				</div>

				{description && (
					<p className="text-xs sm:text-sm text-slate-600 mb-4">{description}</p>
				)}

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
					<button
						onClick={onClose}
						disabled={confirmLoading}
						className="flex-1 px-4 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-regular hover:bg-slate-50 transition-colors order-2 sm:order-1 disabled:opacity-50"
					>
						Отмена
					</button>
					<button
						onClick={onConfirm}
						disabled={confirmLoading}
						className={`flex-1 px-4 py-2 h-10 rounded-lg ${buttonColor} text-white text-sm font-regular disabled:opacity-50 transition-colors order-1 sm:order-2`}
					>
						{confirmLoading ? '...' : confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}
