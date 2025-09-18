import React from 'react'
import Logo from './Logo'

function Navigation() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Logo />
					</div>
					{/* Navigation Links */}
					<div className="hidden md:flex items-center space-x-6">
						<a href="#about" className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide">
							Обо мне
						</a>
						<a href="#method" className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide">
							P-DTR метод
						</a>
						<a href="#services" className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide">
							Услуги
						</a>
						<a href="#testimonials" className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide">
							Отзывы
						</a>
						<a href="#formats" className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide">
							Форматы
						</a>
						<a href="#contacts" className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide">
							Контакты
						</a>
					</div>

					{/* CTA Button */}
					<div className="flex-shrink-0">
						<button className="bg-gradient-to-r from-ocean-500 to-blue-600 text-white px-6 py-2.5 rounded-full hover:from-ocean-600 hover:to-blue-700 transform  transition-all duration-300 text-[13px] flex items-center gap-2 uppercase shadow-md hover:shadow-ocean-500/25">
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
