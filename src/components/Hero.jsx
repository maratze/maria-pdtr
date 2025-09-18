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
					<div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">

						<div className="lg:col-span-6 space-y-8">
							<Badge />
							<MainHeading />
							<Description />
							<KeyAchievements />
							<ProfessionalActivities />
						</div>

						<HeroImage />
					</div>
				</div>
			</div>
		</section>
	)
}

export default Hero
