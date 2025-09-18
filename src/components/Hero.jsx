import React from 'react'
import Badge from './Badge'
import MainHeading from './MainHeading'
import Description from './Description'
import KeyAchievements from './KeyAchievements'
import ProfessionalActivities from './ProfessionalActivities'
import HeroImage from './HeroImage'

function Hero() {
	return (
		<section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="relative min-h-screen flex items-center">
					<div className="max-w-[500px] space-y-8 z-20">
						<Badge />
						<MainHeading />
						<Description />
						<KeyAchievements />
						{/* <ProfessionalActivities /> */}
					</div>

					<HeroImage />
				</div>
			</div>
		</section>
	)
}

export default Hero
