import React from 'react'
import Logo from './Logo'

function Navigation() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Logo />
					</div>
					{/* Navigation Links */}
					<div className="hidden md:flex items-center space-x-4">
						<a href="#about" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors duration-200 font-medium uppercase">
							Обо мне
						</a>
						<a href="#method" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors duration-200 font-medium uppercase">
							P-DTR метод
						</a>
						<a href="#services" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors duration-200 font-medium uppercase">
							Услуги
						</a>
						<a href="#testimonials" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors duration-200 font-medium uppercase">
							Отзывы
						</a>
						<a href="#formats" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors duration-200 font-medium uppercase">
							Форматы
						</a>
						<a href="#contacts" className="text-sm text-slate-600 hover:text-ocean-600 transition-colors duration-200 font-medium uppercase">
							Контакты
						</a>
					</div>

					{/* CTA Button */}
					<div className="flex-shrink-0">
						<button className="bg-ocean-600 text-white px-6 py-2.5 rounded-full hover:bg-ocean-700 transition-colors duration-200 text-[13px] flex items-center gap-2 uppercase font-thin">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							Записаться
						</button>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navigation
