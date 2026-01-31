import React from 'react'
import Badge from './Badge'
import MainHeading from './MainHeading'
import Description from './Description'
import KeyAchievements from './KeyAchievements'
import HeroImage from './HeroImage'
import { FaTelegram, FaTelegramPlane } from 'react-icons/fa'

function Hero() {
	return (
		<section id="about" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900 overflow-hidden">
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

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 pt-20 min-sm:pt-24 sm:pt-32 pb-20">
				<div className="flex flex-col min-sm:flex-row gap-2 min-[1200px]:hidden mb-4">
					<a
						href="https://t.me/maria_pdtr?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%85%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C%D1%81%D1%8F%20%D0%BD%D0%B0%20%D1%81%D0%B5%D0%B0%D0%BD%D1%81"
						target="_blank"
						rel="noopener noreferrer"
						className="bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-5 py-3 rounded-full hover:bg-ocean-500 transform transition-all duration-300 text-base flex items-center justify-center gap-2 shadow-md hover:shadow-ocean-500/25 font-light"
					>
						<FaTelegramPlane className="text-xl" />
						Заявка на сеанс
					</a>

					<a
						href="https://t.me/maria_pdtr?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%85%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C%D1%81%D1%8F%20%D0%BD%D0%B0%20%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5"
						target="_blank"
						rel="noopener noreferrer"
						className="bg-white/10 text-white px-5 py-3 rounded-full hover:bg-white-20 transform transition-all duration-300 text-base flex items-center justify-center gap-2 shadow-md hover:shadow-white-500/25 font-light"
					>
						<FaTelegramPlane className="text-xl" />
						<span>Заявка на обучение</span>
					</a>
				</div>
				<div className="relative flex items-baseline justify-self-center md:justify-self-stretch lg:items-center">
					<div className="max-w-full md:max-w-[500px] space-y-6 sm:space-y-8 z-30 relative">
						<Badge />

						<MainHeading />
						<Description />
						<KeyAchievements />
						{/* <ProfessionalActivities /> */}
					</div>
				</div>
			</div>
			<HeroImage />		</section>
	)
}

export default Hero
