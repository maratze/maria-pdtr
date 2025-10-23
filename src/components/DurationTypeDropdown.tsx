import type { DurationType } from '../types/service'
import Dropdown from './Dropdown'

interface DurationTypeDropdownProps {
	value: DurationType
	onChange: (value: DurationType) => void
	label?: string
	required?: boolean
}

const DURATION_TYPE_OPTIONS = [
	{ id: 'minutes' as const, label: 'Минуты' },
	{ id: 'hours' as const, label: 'Часы' },
	{ id: 'sessions' as const, label: 'Сеансы' },
	{ id: 'none' as const, label: 'Без указания времени' }
]

export default function DurationTypeDropdown({
	value,
	onChange,
	label = 'Тип длительности',
	required = false
}: DurationTypeDropdownProps) {
	const handleChange = (selectedId: string | number | null) => {
		if (selectedId) {
			onChange(selectedId as DurationType)
		}
	}

	return (
		<div>
			{label && (
				<label className="block text-sm font-medium text-slate-700 mb-1.5">
					{label}
					{required && <span className="text-red-500"> *</span>}
				</label>
			)}
			<Dropdown
				options={DURATION_TYPE_OPTIONS}
				value={value}
				onChange={handleChange}
				placeholder="Выберите тип длительности"
			/>
		</div>
	)
}
