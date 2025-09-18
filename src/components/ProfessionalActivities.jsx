import React from 'react'

function ProfessionalActivities() {
	return (
		<div className="space-y-3">
			<div className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm border border-ocean-100/50 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300">
				<div className="bg-ocean-100 p-2 rounded-lg flex-shrink-0">
					<svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
					</svg>
				</div>
				<div>
					<h4 className="font-semibold text-slate-900 text-sm mb-1">15 семинаров повышения квалификации</h4>
					<p className="text-xs text-slate-600 leading-relaxed">5 базовых + 5 у Хосе (1,2, интермедия, эдванс, визуальная диагностика, нозология) + авторские (плечо, колено, висцеральная система, ВНЧС, эмоции)</p>
				</div>
			</div>

			<div className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm border border-ocean-100/50 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300">
				<div className="bg-ocean-100 p-2 rounded-lg flex-shrink-0">
					<svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
				<div>
					<h4 className="font-semibold text-slate-900 text-sm mb-1">Научно-исследовательская работа</h4>
					<p className="text-xs text-slate-600">в области неврологии и реабилитации</p>
				</div>
			</div>

			<div className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm border border-ocean-100/50 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300">
				<div className="bg-ocean-100 p-2 rounded-lg flex-shrink-0">
					<svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<div>
					<h4 className="font-semibold text-slate-900 text-sm mb-1">Приглашение автора метода</h4>
					<p className="text-xs text-slate-600">P-DTR в Россию для проведения мастер-классов</p>
				</div>
			</div>

			<div className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm border border-ocean-100/50 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300">
				<div className="bg-ocean-100 p-2 rounded-lg flex-shrink-0">
					<svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
					</svg>
				</div>
				<div>
					<h4 className="font-semibold text-slate-900 text-sm mb-1">Психоэмоциональная коррекция</h4>
					<p className="text-xs text-slate-600">авторская методика для работы с эмоциональными блоками</p>
				</div>
			</div>

			<div className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm border border-ocean-100/50 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300">
				<div className="bg-ocean-100 p-2 rounded-lg flex-shrink-0">
					<svg className="w-5 h-5 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<div>
					<h4 className="font-semibold text-slate-900 text-sm mb-1">Активное участие</h4>
					<p className="text-xs text-slate-600">в развитии и популяризации метода P-DTR в России</p>
				</div>
			</div>
		</div>
	)
}

export default ProfessionalActivities
