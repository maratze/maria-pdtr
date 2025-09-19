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
		<div className="space-y-6">
			{/* Статистика - акцентный блок */}
			<div className="flex flex-wrap justify-start gap-4 lg:gap-8">
				{stats.map((stat, index) => {
					return (
						<div key={index} className="text-center group">
							<div className="text-3xl sm:text-4xl font-medium text-ocean-300 leading-none">
								{stat.number}
							</div>
							<div className="text-sm text-slate-200">
								{stat.text}
							</div>
						</div>
					)
				})}
			</div>

			{/* Остальные достижения */}
			<div>
				{achievements.map((achievement, index) => {
					const IconComponent = achievement.icon
					return (
						<div
							key={index}
							className="flex items-center gap-3 py-1 rounded-lg transition-colors duration-200"
						>
							<div className="flex-shrink-0">
								<IconComponent className="text-xl text-ocean-300" />
							</div>
							<div className="flex-1">
								<p className="text-md text-slate-200 leading-snug">
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