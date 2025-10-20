import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

function NotFound() {
	const navigate = useNavigate()

	const handleScrollToSection = (sectionId) => {
		navigate('/')
		setTimeout(() => {
			const element = document.getElementById(sectionId)
			if (element) {
				const elementPosition = element.offsetTop
				const offsetPosition = elementPosition - 80
				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth'
				})
			}
		}, 100)
	}

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900 overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8">
			{/* Animated background from Hero */}
			<div className="absolute inset-0">
				{/* Main gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-ocean-600/20 via-transparent to-slate-800/30"></div>

				{/* Static circles */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ocean-400/10 rounded-full blur-3xl"></div>
				<div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>

				{/* Dot grid */}
				<div className="absolute inset-0 opacity-30">
					<div
						className="w-full h-full"
						style={{
							backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
							backgroundSize: '50px 50px'
						}}
					></div>
				</div>
			</div>

			<div className="max-w-2xl w-full text-center relative z-10">
				{/* 404 Number */}
				<div className="mb-8">
					<h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-bold text-ocean-400/30 leading-none">
						404
					</h1>
				</div>

				{/* Icon */}
				<div className="flex justify-center mb-6">
					<div className="w-20 h-20 sm:w-24 sm:h-24 bg-ocean-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
						<svg
							className="w-10 h-10 sm:w-12 sm:h-12 text-ocean-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
				</div>

				{/* Title */}
				<h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4">
					Страница не найдена
				</h2>

				{/* Description */}
				<p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-md mx-auto">
					К сожалению, запрашиваемая страница не существует или была перемещена.
				</p>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<Link
						to="/"
						className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-8 py-4 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 text-base font-light transform hover:scale-[1.02]"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
						На главную
					</Link>
				</div>

				{/* Additional Links */}
				<div className="mt-12 pt-8 border-t border-white/10">
					<p className="text-sm text-slate-400 mb-4">Популярные разделы:</p>
					<div className="flex flex-wrap justify-center gap-3">
						<button
							onClick={() => handleScrollToSection('about')}
							className="text-sm text-ocean-300 hover:text-ocean-200 font-regular transition-colors duration-300 cursor-pointer"
						>
							Обо мне
						</button>
						<span className="text-slate-600">•</span>
						<button
							onClick={() => handleScrollToSection('method')}
							className="text-sm text-ocean-300 hover:text-ocean-200 font-regular transition-colors duration-300 cursor-pointer"
						>
							P-DTR метод
						</button>
						<span className="text-slate-600">•</span>
						<button
							onClick={() => handleScrollToSection('testimonials')}
							className="text-sm text-ocean-300 hover:text-ocean-200 font-regular transition-colors duration-300 cursor-pointer"
						>
							Отзывы
						</button>
						<span className="text-slate-600">•</span>
						<button
							onClick={() => handleScrollToSection('services')}
							className="text-sm text-ocean-300 hover:text-ocean-200 font-regular transition-colors duration-300 cursor-pointer"
						>
							Услуги
						</button>
						<span className="text-slate-600">•</span>
						<button
							onClick={() => handleScrollToSection('contacts')}
							className="text-sm text-ocean-300 hover:text-ocean-200 font-regular transition-colors duration-300 cursor-pointer"
						>
							Контакты
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default NotFound
