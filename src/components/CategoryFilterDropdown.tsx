import Dropdown from './Dropdown'
import type { Category } from '../types/review'

interface CategoryFilterDropdownProps {
	categories: Category[]
	value: string | null
	onChange: (categoryId: string | null) => void
}

export default function CategoryFilterDropdown({ categories, value, onChange }: CategoryFilterDropdownProps) {
	const options = categories.map(category => ({
		id: category.id,
		label: category.name
	}))

	return (
		<Dropdown
			options={options}
			value={value}
			onChange={(v) => onChange(v as string | null)}
			placeholder="Все категории"
			hasNullOption={true}
			nullOptionLabel="Все категории"
			emptyMessage="Нет доступных категорий"
		/>
	)
}
