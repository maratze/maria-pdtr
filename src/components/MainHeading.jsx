import React from 'react'

function MainHeading() {
	return (
		<div className="space-y-8">
			<h1 className="flex gap-2 lg:block text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
				<span className="block">Мария</span>
				<span className="block bg-gradient-to-r from-blue-300 to-ocean-600 bg-clip-text text-transparent">
					Соломкина
				</span>
			</h1>
			<div className="block lg:flex flex-wrap items-center gap-x-4 text-md text-slate-200 font-medium">
				<div className="flex items-center gap-x-2">
					<span className="lg:hidden w-1.5 h-1.5 bg-ocean-300 rounded-full"></span>
					<span>Специалист метода P-DTR</span>
				</div>
				<div className="hidden lg:block w-1.5 h-1.5 bg-ocean-300 rounded-full"></div>
				<div className="flex items-center gap-x-2">
					<span className="lg:hidden w-1.5 h-1.5 bg-ocean-300 rounded-full"></span>
					<span>Неврология</span>
				</div>
				<div className="hidden lg:block w-1.5 h-1.5 bg-ocean-300 rounded-full"></div>
				<div className="flex items-center gap-x-2">
					<span className="lg:hidden w-1.5 h-1.5 bg-ocean-300 rounded-full"></span>
					<span>Реабилитация</span>
				</div>
			</div>
		</div >
	)
}

export default MainHeading
