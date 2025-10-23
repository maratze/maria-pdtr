import Dropdown from './Dropdown'

interface StatusDropdownProps {
	value: 'all' | 'pending' | 'approved'
	onChange: (status: 'all' | 'pending' | 'approved') => void
}

const STATUS_OPTIONS = [
	{ id: 'all', label: 'Все статусы' },
	{ id: 'pending', label: 'На модерации' },
	{ id: 'approved', label: 'Одобренные' }
] as const

export default function StatusDropdown({ value, onChange }: StatusDropdownProps) {
	const options = [...STATUS_OPTIONS] as Array<{ id: string; label: string }>

	return (
		<Dropdown
			options={options}
			value={value}
			onChange={(v) => onChange(v as 'all' | 'pending' | 'approved')}
			placeholder="Все статусы"
			emptyMessage="Нет доступных статусов"
		/>
	)
}
