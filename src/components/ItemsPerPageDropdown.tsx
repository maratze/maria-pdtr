import Dropdown from './Dropdown'

interface ItemsPerPageDropdownProps {
	value: number
	onChange: (value: number) => void
}

const ITEMS_OPTIONS = [
	{ id: 5, label: '5' },
	{ id: 10, label: '10' },
	{ id: 25, label: '25' },
	{ id: 50, label: '50' },
	{ id: 100, label: '100' }
]

export default function ItemsPerPageDropdown({ value, onChange }: ItemsPerPageDropdownProps) {
	return (
		<Dropdown
			options={ITEMS_OPTIONS}
			value={value}
			onChange={(v) => onChange(v as number)}
			placeholder="5"
			emptyMessage="Нет доступных опций"
		/>
	)
}
