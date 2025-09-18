import React, { useState, useEffect } from 'react'
import Logo from './Logo'

function Navigation() {
	const [isScrolled, setIsScrolled] = useState(false)
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY
			setIsScrolled(scrollTop > 50)
		}

		window.addEventListener('scroll', handleScroll)

		// Cleanup listener
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	return (
		<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-100 border-b ${isScrolled ? 'backdrop-blur-md bg-slate-900/80 border-white/10' : 'border-transparent'} ${isMobileMenuOpen ? 'max-[999px]:backdrop-blur-md' : ''}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<div className="flex-shrink-0 relative z-50">
						<Logo />
					</div>

					{/* Desktop Navigation Links */}
					<div className="hidden min-[1000px]:flex items-center space-x-6">
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

					{/* CTA Button - Desktop */}
					<div className="hidden min-[1000px]:block flex-shrink-0">
						<button className="bg-ocean-800 text-white px-6 py-3 rounded-full hover:bg-ocean-700 transform transition-all duration-300 text-[13px] flex items-center gap-2 uppercase shadow-md hover:shadow-ocean-500/25">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							Записаться
						</button>
					</div>

					{/* Mobile Burger Menu Button */}
					<div className="min-[1000px]:hidden relative z-50">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="text-white p-2 rounded-md transition-all duration-300 hover:text-white/70 relative z-50"
							aria-label="Открыть меню"
						>
							<svg
								className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{isMobileMenuOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>

			</div>

			{/* Mobile Menu - Centered Overlay */}
			<div className={`min-[1000px]:hidden fixed inset-0 z-40 transition-all duration-100 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
				<div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>

				{/* Menu Content */}
				<div className="relative flex items-center justify-center min-h-screen p-4 bg-slate-900">
					<div className="py-4">
						{/* Mobile Navigation Links */}
						<div className="flex flex-col items-center space-y-4">
							<a
								href="#about"
								className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide py-3 text-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Обо мне
							</a>
							<a
								href="#method"
								className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide py-3 text-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								P-DTR метод
							</a>
							<a
								href="#services"
								className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide py-3 text-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Услуги
							</a>
							<a
								href="#testimonials"
								className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide py-3 text-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Отзывы
							</a>
							<a
								href="#formats"
								className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide py-3 text-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Форматы
							</a>
							<a
								href="#contacts"
								className="text-sm text-white hover:text-ocean-300 transition-all duration-300 font-medium uppercase tracking-wide py-3 text-center"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Контакты
							</a>
						</div>

						{/* CTA Button for mobile menu */}
						<div className="pt-6 flex justify-center">
							<button
								className="bg-ocean-800 text-white px-8 py-3 rounded-full hover:bg-ocean-700 transform transition-all duration-300 text-[13px] flex items-center gap-2 uppercase shadow-md hover:shadow-ocean-500/25"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Записаться
							</button>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navigation
