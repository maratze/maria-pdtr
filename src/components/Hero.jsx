import React from 'react'
import Badge from './Badge'
import MainHeading from './MainHeading'
import Description from './Description'
import KeyAchievements from './KeyAchievements'
import ProfessionalActivities from './ProfessionalActivities'
import HeroImage from './HeroImage'

function Hero() {
	return (
		<section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900 overflow-hidden">
			{/* Анимированный фон с геометрическими фигурами */}
			<div className="absolute inset-0">
				{/* Основной градиент */}
				<div className="absolute inset-0 bg-gradient-to-br from-ocean-600/20 via-transparent to-slate-800/30"></div>

				{/* Статичные круги */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ocean-400/10 rounded-full blur-3xl"></div>
				<div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>

				{/* Сетка точек */}
				<div className="absolute inset-0 opacity-30">
					<div
						className="w-full h-full"
						style={{
							backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
							backgroundSize: '50px 50px'
						}}
					></div>
				</div>

				{/* Диагональные линии */}
				<div className="absolute inset-0">
					<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocean-400/30 to-transparent transform rotate-12 origin-left"></div>
					<div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent transform -rotate-12 origin-left"></div>
					<div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform rotate-6 origin-left"></div>
				</div>
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
				<div className="relative flex items-baseline lg:items-center pt-32 md:pb-24">
					<div className="max-w-[500px] space-y-6 sm:space-y-8 z-30 relative">
						<Badge />
						<MainHeading />
						<Description />
						<KeyAchievements />
						{/* <ProfessionalActivities /> */}
					</div>
				</div>
			</div>
			<HeroImage />

		</section>
	)
}

export default Hero
