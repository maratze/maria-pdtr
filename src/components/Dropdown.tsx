import { useState, useRef, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface DropdownOption {
	id: string | number
	label: string
}

interface DropdownProps<T extends DropdownOption> {
	options: T[]
	value: string | number | null
	onChange: (value: string | number | null) => void
	placeholder?: string
	label?: string
	required?: boolean
	emptyMessage?: string
	hasNullOption?: boolean
	nullOptionLabel?: string
	renderValue?: (option: T | null) => ReactNode
	renderOption?: (option: T) => ReactNode
}

export default function Dropdown<T extends DropdownOption>({
	options,
	value,
	onChange,
	placeholder = 'Выберите опцию',
	label,
	required = false,
	emptyMessage = 'Нет доступных опций',
	hasNullOption = false,
	nullOptionLabel = 'Все',
	renderValue,
	renderOption
}: DropdownProps<T>) {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
	const containerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const selectedOption = value ? options.find(o => o.id === value) : null

	// Calculate dropdown position
	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const updatePosition = () => {
				if (!buttonRef.current) return

				const rect = buttonRef.current.getBoundingClientRect()
				const viewportHeight = window.innerHeight
				const dropdownHeight = dropdownRef.current?.offsetHeight || 300
				const spaceBelow = viewportHeight - rect.bottom
				const spaceAbove = rect.top

				const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

				setPosition({
					top: shouldOpenUpwards ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
					left: rect.left,
					width: rect.width
				})
			}

			updatePosition()

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					updatePosition()
				})
			})
		}
	}, [isOpen])

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				const portal = document.querySelector('[data-dropdown-portal]')
				if (portal && portal.contains(event.target as Node)) {
					return
				}
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const displayValue = renderValue
		? renderValue(selectedOption || null)
		: selectedOption?.label || placeholder

	return (
		<div className="relative" ref={containerRef}>
			{label && (
				<label className="block text-sm font-medium text-slate-700 mb-1.5">
					{label}
					{required && <span className="text-red-500">*</span>}
				</label>
			)}

			{/* Button */}
			<button
				type="button"
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-regular flex items-center justify-between hover:border-ocean-300 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 transition-colors"
			>
				<span className="text-slate-900 truncate">{displayValue}</span>
				<svg
					className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{/* Dropdown Menu via Portal */}
			{isOpen && createPortal(
				<div
					ref={dropdownRef}
					data-dropdown-portal
					className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden"
					style={{
						top: `${position.top}px`,
						left: `${position.left}px`,
						width: `${position.width}px`
					}}
					onClick={(e) => e.stopPropagation()}
				>
					{options.length === 0 && !hasNullOption ? (
						<div className="px-4 py-3 text-sm text-slate-500 text-center">
							{emptyMessage}
						</div>
					) : (
						<>
							{/* Null option */}
							{hasNullOption && (
								<>
									<button
										onClick={(e) => {
											e.stopPropagation()
											onChange(null)
											setIsOpen(false)
										}}
										className={`w-full text-left px-4 py-3 text-sm font-regular transition-colors flex items-center gap-2 ${value === null
											? 'bg-ocean-50 text-ocean-700'
											: 'text-slate-700 hover:bg-slate-50'
											}`}
									>
										<span className="flex-1">{nullOptionLabel}</span>
										{value === null && (
											<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										)}
									</button>
									{options.length > 0 && (
										<div className="border-t border-slate-100"></div>
									)}
								</>
							)}

							{/* Options */}
							{options.map((option) => (
								<button
									key={option.id}
									onClick={(e) => {
										e.stopPropagation()
										onChange(option.id)
										setIsOpen(false)
									}}
									className={`w-full text-left px-4 py-3 text-sm font-regular transition-colors flex items-center gap-2 ${value === option.id
										? 'bg-ocean-50 text-ocean-700'
										: 'text-slate-700 hover:bg-slate-50'
										}`}
								>
									<span className="flex-1">
										{renderOption ? renderOption(option) : option.label}
									</span>
									{value === option.id && (
										<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
										</svg>
									)}
								</button>
							))}
						</>
					)}
				</div>,
				document.body
			)}
		</div>
	)
}
