import Dropdown from './Dropdown'
import type { City } from '../types/booking'

interface CityDropdownProps {
	cities: City[]
	value: string
	onChange: (cityId: string) => void
	label?: string
	required?: boolean
}

export default function CityDropdown({
	cities,
	value,
	onChange,
	label = '',
	required = false
}: CityDropdownProps) {
	const options = cities.map(city => ({
		id: city.id,
		label: city.name
	}))

	return (
		<Dropdown
			options={options}
			value={value || null}
			onChange={(v) => onChange(v as string)}
			placeholder="Выберите город"
			label={label}
			required={required}
			emptyMessage="Нет доступных городов"
		/>
	)
}
