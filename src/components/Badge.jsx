import React from 'react'

function Badge() {
	return (
		<div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm">
			<div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
			Доступны онлайн консультации
		</div>
	)
}

export default Badge
