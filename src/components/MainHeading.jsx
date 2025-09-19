import React from 'react'

function MainHeading() {
	return (
		<div className="space-y-8">
			<h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
				<span className="block">Мария</span>
				<span className="block bg-gradient-to-r from-ocean-300 to-blue-400 bg-clip-text text-transparent">
					Соломкина
				</span>
			</h1>
			<div className="flex flex-wrap items-center gap-x-4 text-md text-slate-200 font-medium">
				<span>Специалист метода P-DTR</span>
				<div className="w-1.5 h-1.5 bg-ocean-300 rounded-full"></div>
				<span>Неврология</span>
				<div className="w-1.5 h-1.5 bg-ocean-300 rounded-full"></div>
				<span>Реабилитация</span>
			</div>
		</div>
	)
}

export default MainHeading
