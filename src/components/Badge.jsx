import React from 'react'

function Badge() {
	return (
		<div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[13px] font-regular text-white shadow-lg">
			<div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
			Доступны онлайн консультации
		</div>
	)
}

export default Badge
