import React from 'react'

function ProfessionalActivities() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<svg className="w-7 h-7 text-ocean-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
				</svg>
				<div>
					<h4 className="font-medium text-slate-900">Организация семинаров</h4>
					<p className="text-sm text-slate-500">по обучению методу P-DTR для специалистов</p>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<svg className="w-7 h-7 text-ocean-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<div>
					<h4 className="font-medium text-slate-900">Приглашение автора метода</h4>
					<p className="text-sm text-slate-500">P-DTR в Россию для проведения мастер-классов</p>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<svg className="w-7 h-7 text-ocean-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				<div>
					<h4 className="font-medium text-slate-900">Активное участие</h4>
					<p className="text-sm text-slate-500">в развитии и популяризации метода P-DTR в России</p>
				</div>
			</div>
		</div>
	)
}

export default ProfessionalActivities
