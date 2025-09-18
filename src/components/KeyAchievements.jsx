import React from 'react'

function KeyAchievements() {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				<div className="bg-white backdrop-blur-sm border border-ocean-600/20 rounded-2xl p-4 sm:p-5 text-center hover:shadow-md hover:border-ocean-600/35 transform hover:-translate-y-1 transition-all duration-300 min-h-[110px] flex flex-col justify-center">
					<div className="text-2xl sm:text-3xl font-bold text-ocean-600 leading-none">3+</div>
					<div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">года в P-DTR</div>
				</div>

				<div className="bg-white backdrop-blur-sm border border-ocean-600/20 rounded-2xl p-4 sm:p-5 text-center hover:shadow-md hover:border-ocean-600/35 transform hover:-translate-y-1 transition-all duration-300 min-h-[110px] flex flex-col justify-center">
					<div className="text-2xl sm:text-3xl font-bold text-ocean-600 mb-2 leading-none">15+</div>
					<div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">семинаров</div>
				</div>

				<div className="bg-white backdrop-blur-sm border border-ocean-600/20 rounded-2xl p-4 sm:p-5 text-center hover:shadow-md hover:border-ocean-600/35 transform hover:-translate-y-1 transition-all duration-300 min-h-[110px] flex flex-col justify-center sm:col-span-2 lg:col-span-1">
					<div className="text-2xl sm:text-3xl font-bold text-ocean-600 mb-2 leading-tight">100+</div>
					<div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">здоровых клиентов</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
				<div className="bg-white backdrop-blur-sm border border-ocean-600/20 rounded-2xl p-4 sm:p-5 text-center hover:shadow-md hover:border-ocean-600/35 transform hover:-translate-y-1 transition-all duration-300 min-h-[110px] flex flex-col justify-center">
					<div className="text-3xl sm:text-4xl lg:text-5xl mb-2 leading-none">🧬</div>
					<div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">научно-исследовательская работа</div>
				</div>

				<div className="bg-white backdrop-blur-sm border border-ocean-600/20 rounded-2xl p-4 sm:p-5 text-center hover:shadow-md hover:border-ocean-600/35 transform hover:-translate-y-1 transition-all duration-300 min-h-[110px] flex flex-col justify-center">
					<div className="text-3xl sm:text-4xl lg:text-5xl mb-2 leading-none">🧠</div>
					<div className="text-xs sm:text-sm text-slate-600 font-medium leading-tight">психоэмоциональная коррекция</div>
				</div>
			</div>
		</div>
	)
}

export default KeyAchievements