import React from 'react'

function HeroImage() {
	return (
		<div className="relative m-auto sm:bottom-0 sm:left-0 max-w-full w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] md:absolute md:left-[44%] md:w-[660px] md:h-[660px] lg:left-[40%] lg:w-[800px] lg:h-[800px] z-10">
			{/* Multiple Glow Layers for Enhanced Effect */}

			{/* Outermost glow - largest and most diffuse */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-5 scale-115"
				style={{
					backgroundImage: "url('/src/assets/images/main-image.png')"
				}}
			></div>

			{/* Middle glow - medium blur */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-20 scale-115"
				style={{
					backgroundImage: "url('/src/assets/images/main-image.png')"
				}}
			></div>

			{/* Inner glow - subtle blur */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-15 scale-115"
				style={{
					backgroundImage: "url('/src/assets/images/main-image.png')"
				}}
			></div>

			{/* Colored glow layers */}
			<div className="absolute inset-0 bg-gradient-radial from-ocean-600/15 via-ocean-600/15 to-transparent blur-3xl scale-120"></div>
			<div className="absolute bottom-0 inset-0 bg-gradient-radial from-ocean-600/15 via-ocean-300/15 to-transparent blur-2xl scale-115"></div>

			{/* Main Image */}
			<div
				className="relative z-10 bg-cover bg-center bg-no-repeat w-full h-full"
				style={{
					backgroundImage: "url('/src/assets/images/main-image.png')"
				}}
			>
			</div>
		</div>
	)
}

export default HeroImage
