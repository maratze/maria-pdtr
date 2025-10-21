import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ItemsPerPageDropdownProps {
	value: number
	onChange: (value: number) => void
}

const ITEMS_OPTIONS = [5, 10, 25, 50, 100]

export default function ItemsPerPageDropdown({ value, onChange }: ItemsPerPageDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
	const containerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Calculate dropdown position
	useEffect(() => {
		if (isOpen && buttonRef.current) {
			const updatePosition = () => {
				if (!buttonRef.current) return

				const rect = buttonRef.current.getBoundingClientRect()
				const viewportHeight = window.innerHeight
				const dropdownHeight = dropdownRef.current?.offsetHeight || 250
				const spaceBelow = viewportHeight - rect.bottom
				const spaceAbove = rect.top

				// Определяем, открывать вверх или вниз
				const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

				setPosition({
					top: shouldOpenUpwards ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
					left: rect.left,
					width: rect.width
				})
			}

			// Сначала устанавливаем начальную позицию
			updatePosition()

			// Затем пересчитываем после рендера dropdown (двойной RAF для гарантии)
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					updatePosition()
				})
			})
		}
	}, [isOpen])	// Close dropdown when clicking outside
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

	return (
		<div className="relative" ref={containerRef}>
			{/* Button */}
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-regular flex items-center justify-between hover:border-ocean-300 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 transition-colors"
			>
				<span>{value}</span>
				<svg
					className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
				>
					{ITEMS_OPTIONS.map((option, index) => (
						<button
							key={option}
							onClick={() => {
								onChange(option)
								setIsOpen(false)
							}}
							className={`w-full text-left px-4 py-3 text-sm font-regular transition-colors flex items-center gap-2 ${value === option
								? 'bg-ocean-50 text-ocean-700'
								: 'text-slate-700 hover:bg-slate-50'
								} ${index === ITEMS_OPTIONS.length - 1 ? 'rounded-b-lg' : ''}`}
						>
							{value === option && (
								<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
							)}
							<span className="flex-1">{option}</span>
						</button>
					))}
				</div>,
				document.body
			)}
		</div>
	)
}
