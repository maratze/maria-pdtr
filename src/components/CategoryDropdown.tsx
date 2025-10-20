import { useState, useRef, useEffect } from 'react'
import type { Category } from '../types/review'

interface CategoryDropdownProps {
	categories: Category[]
	value: string | null
	onChange: (categoryId: string | null) => void
	disabled?: boolean
}

export default function CategoryDropdown({ categories, value, onChange, disabled = false }: CategoryDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const selectedCategory = value ? categories.find(c => c.id === value) : null

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className="relative" ref={containerRef}>
			{/* Button */}
			<button
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-regular flex items-center justify-between hover:border-ocean-300 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors"
			>
				<span className={selectedCategory ? 'text-slate-900' : 'text-slate-500'}>
					{selectedCategory ? selectedCategory.name : 'Без категории'}
				</span>
				<svg
					className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-40 overflow-hidden">
					{/* "Без категории" option */}
					<button
						onClick={() => {
							onChange(null)
							setIsOpen(false)
						}}
						className={`w-full text-left px-4 py-3 text-sm font-regular transition-colors flex items-center gap-2 ${!selectedCategory
							? 'bg-ocean-50 text-ocean-700'
							: 'text-slate-700 hover:bg-slate-50'
							}`}
					>
						{!selectedCategory && (
							<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
						)}
						<span className="flex-1">Без категории</span>
					</button>

					{/* Divider if there are categories */}
					{categories.length > 0 && (
						<div className="border-t border-slate-100"></div>
					)}

					{/* Category options */}
					{categories.map((category, index) => (
						<button
							key={category.id}
							onClick={() => {
								onChange(category.id)
								setIsOpen(false)
							}}
							className={`w-full text-left px-4 py-3 text-sm font-regular transition-colors flex items-center gap-2 ${selectedCategory?.id === category.id
								? 'bg-ocean-50 text-ocean-700'
								: 'text-slate-700 hover:bg-slate-50'
								} ${index === categories.length - 1 ? 'rounded-b-lg' : ''}`}
						>
							{selectedCategory?.id === category.id && (
								<svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
								</svg>
							)}
							<span className="flex-1">{category.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
