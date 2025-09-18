import React from 'react'
import {
	HiOutlineBeaker,
	HiOutlineLightBulb,
	HiOutlineCalendar,
	HiOutlineAcademicCap,
	HiOutlineHeart,
	HiOutlineCheckCircle
} from 'react-icons/hi'

function KeyAchievements() {
	const stats = [
		{ number: "3+", text: "года в P-DTR" },
		{ number: "15+", text: "семинаров" },
		{ number: "100+", text: "здоровых клиентов" }
	]

	const achievements = [
		{
			icon: HiOutlineBeaker,
			text: "Активная научно-исследовательская работа",
			highlight: null
		},
		{
			icon: HiOutlineLightBulb,
			text: "Экспертиза в психоэмоциональной коррекции",
			highlight: null
		},
		{
			icon: HiOutlineCheckCircle,
			text: "Сертифицированный специалист P-DTR",
			highlight: null
		}
	]

	return (
		<div className="space-y-4">
			{/* Статистика в одну строку */}
			<div className="inline-flex flex-wrap gap-6 py-3 px-4 bg-ocean-100/50 rounded-xl border border-ocean-600/25">
				{stats.map((stat, index) => {
					return (
						<div key={index} className="flex items-center gap-2">
							<span className="flex items-center gap-1 text-md text-slate-700">
								<span className="text-ocean-600 font-medium">{stat.number}</span>
								<span>{stat.text}</span>
							</span>
						</div>
					)
				})}
			</div>

			{/* Остальные достижения */}
			<div className="space-y-2">
				{achievements.map((achievement, index) => {
					const IconComponent = achievement.icon
					return (
						<div
							key={index}
							className="flex items-center gap-3 py-2 hover:bg-ocean-50/30 rounded-lg transition-colors duration-200"
						>
							<div className="flex-shrink-0">
								<IconComponent className="text-lg text-ocean-600" />
							</div>
							<div className="flex-1">
								<p className="text-md text-slate-700 leading-snug">
									{achievement.text}
								</p>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default KeyAchievements