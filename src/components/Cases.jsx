import React, { useState, useEffect } from 'react'
import SectionHeader from './SectionHeader'
import SectionDescription from './SectionDescription'
import { getCases } from '../lib/cases'

const Cases = () => {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [selectedCase, setSelectedCase] = useState(null)
	const [isHovered, setIsHovered] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [cases, setCases] = useState([])
	const [loading, setLoading] = useState(true)

	// Загрузка кейсов из базы данных
	useEffect(() => {
		async function loadCases() {
			setLoading(true)
			const { data, error } = await getCases()
			if (!error && data) {
				setCases(data)
			}
			setLoading(false)
		}
		loadCases()
	}, [])

	const nextSlide = () => {
		if (isTransitioning || cases.length === 0) return
		setIsTransitioning(true)

		setCurrentSlide(prev => (prev + 1) % cases.length)

		setTimeout(() => setIsTransitioning(false), 300)
	}

	const prevSlide = () => {
		if (isTransitioning || cases.length === 0) return
		setIsTransitioning(true)

		setCurrentSlide(prev => (prev - 1 + cases.length) % cases.length)

		setTimeout(() => setIsTransitioning(false), 300)
	}

	const goToSlide = (index) => {
		if (isTransitioning) return
		setIsTransitioning(true)

		setCurrentSlide(index)

		setTimeout(() => setIsTransitioning(false), 300)
	}

	const openModal = (caseItem) => {
		setSelectedCase(caseItem)
		document.body.style.overflow = 'hidden'
	}

	const closeModal = () => {
		setSelectedCase(null)
		document.body.style.overflow = 'unset'
	}

	// Создаем массив кейсов
	const displayCases = cases

	// Авторотация карусели
	useEffect(() => {
		if (cases.length === 0 || isHovered) return

		const interval = setInterval(() => {
			setCurrentSlide(prev => (prev + 1) % cases.length)
		}, 5000) // Переключение каждые 5 секунд

		return () => clearInterval(interval)
	}, [cases.length, isHovered])

	// Показываем загрузку или пустое состояние
	if (loading) {
		return (
			<section id="cases" className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-800 via-slate-700 to-ocean-800 overflow-hidden">
				{/* Декоративный фон в стиле Hero */}
				<div className="absolute inset-0">
					{/* Основной градиент */}
					<div className="absolute inset-0 bg-gradient-to-br from-ocean-600/10 via-transparent to-slate-900/30"></div>

					{/* Статичные круги */}
					<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-ocean-400/5 rounded-full blur-3xl"></div>
					<div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
					<div className="absolute top-2/3 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl"></div>

					{/* Сетка точек */}
					<div className="absolute inset-0 opacity-20">
						<div
							className="w-full h-full"
							style={{
								backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
								backgroundSize: '60px 60px'
							}}
						></div>
					</div>

					{/* Диагональные линии */}
					<div className="absolute inset-0">
						<div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocean-400/20 to-transparent transform rotate-6 origin-left"></div>
						<div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/15 to-transparent transform -rotate-3 origin-left"></div>
					</div>
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
					<div className="text-center mb-12 sm:mb-16">
						<SectionHeader title="Кейсы из практики" isDarkMode={true} />
						<SectionDescription text="Реальные истории пациентов, которые восстановили здоровье с помощью P-DTR метода" isDarkMode={true} />
					</div>

					{/* Preloader */}
					<div className="flex items-center justify-center py-12 sm:py-16">
						<div className="text-center">
							<div className="inline-flex items-center justify-center">
								<div className="w-12 h-12 border-4 border-slate-200/30 border-t-white rounded-full animate-spin"></div>
							</div>
							<p className="text-white mt-4 text-base sm:text-lg font-light">Загрузка кейсов...</p>
						</div>
					</div>

					{/* CTA */}
					<div className="text-center mt-12 sm:mt-16 px-4">
						<p className="text-sm sm:text-base text-slate-200 mb-4 sm:mb-6">
							Хотите получить такие же результаты?
						</p>
						<button
							onClick={(e) => {
								e.preventDefault()
								const targetElement = document.getElementById('booking')
								if (targetElement) {
									const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset
									const offsetPosition = elementPosition
									window.scrollTo({
										top: offsetPosition,
										behavior: 'smooth'
									})
								}
							}}
							className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-4 py-3 sm:px-8 sm:py-4 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 text-sm sm:text-base font-light"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							Записаться на консультацию
						</button>
					</div>
				</div>
			</section>
		)
	}

	if (cases.length === 0) {
		return null // Не показываем секцию, если нет кейсов
	}

	return (
		<section id="cases" className="relative py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-slate-800 via-slate-700 to-ocean-800 overflow-hidden">
			{/* Декоративный фон в стиле Hero */}
			<div className="absolute inset-0">
				{/* Основной градиент */}
				<div className="absolute inset-0 bg-gradient-to-br from-ocean-600/10 via-transparent to-slate-900/30"></div>

				{/* Статичные круги */}
				<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-ocean-400/5 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
				<div className="absolute top-2/3 right-1/3 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl"></div>

				{/* Сетка точек */}
				<div className="absolute inset-0 opacity-20">
					<div
						className="w-full h-full"
						style={{
							backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
							backgroundSize: '60px 60px'
						}}
					></div>
				</div>

				{/* Диагональные линии */}
				<div className="absolute inset-0">
					<div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocean-400/20 to-transparent transform rotate-6 origin-left"></div>
					<div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/15 to-transparent transform -rotate-3 origin-left"></div>
				</div>
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
				<div className="text-center mb-12 sm:mb-16">
					<SectionHeader title="Кейсы из практики" isDarkMode={true} />
					<SectionDescription text="Реальные истории пациентов, которые восстановили здоровье с помощью P-DTR метода" isDarkMode={true} />
				</div>

				{/* Carousel Container */}
				<div
					className="relative max-w-4xl mx-auto group"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					{/* Carousel */}
					<div className="relative rounded-2xl overflow-hidden">
						<div
							className="flex items-center transition-transform duration-300 ease-in-out"
							style={{
								transform: `translateX(-${currentSlide * 100}%)`
							}}
						>
							{displayCases.map((caseItem, index) => {
								// Активен слайд на позиции currentSlide
								const isActive = index === currentSlide
								return (
									<div key={caseItem.id} className="w-full flex-shrink-0 px-2 sm:px-4 flex items-center">
										<div className="w-full bg-white/95 backdrop-blur-sm border border-ocean-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 min-h-[470px] md:min-h-[570px] flex flex-col">
											{/* Case Header with Number */}
											<div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
												<div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-medium">
													{String(index + 1).padStart(2, '0')}
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="text-lg sm:text-xl lg:text-2xl font-regular text-slate-700 break-words leading-5">
														{caseItem.title}
													</h3>
													<div className="text-xs sm:text-md text-ocean-600 font-regular mt-1">
														{caseItem.duration}
													</div>
												</div>
											</div>

											{/* Problem Preview */}
											<div className="mb-4 sm:mb-6">
												<h4 className="text-xs sm:text-sm font-medium text-red-600 uppercase tracking-wide mb-2">
													Проблема
												</h4>
												<div
													className="case-content text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-3"
													dangerouslySetInnerHTML={{ __html: caseItem.problem }}
												/>
											</div>

											{/* Solution Preview */}
											<div className="mb-4 sm:mb-6">
												<h4 className="text-xs sm:text-sm font-medium text-ocean-600 uppercase tracking-wide mb-2">
													Решение
												</h4>
												<div
													className="case-content text-sm sm:text-base text-slate-700 leading-relaxed line-clamp-3"
													dangerouslySetInnerHTML={{ __html: caseItem.solution }}
												/>
											</div>

											{/* Result Preview */}
											<div className="mb-4 sm:mb-6">
												<h4 className="text-xs sm:text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
													Результат
												</h4>
												<div
													className="case-content text-sm sm:text-base text-slate-700 leading-relaxed line-clamp-3"
													dangerouslySetInnerHTML={{ __html: caseItem.result }}
												/>
											</div>

											{/* Read More Button */}
											<div className="mt-auto pt-3 sm:pt-4 border-t border-slate-200">
												<button
													onClick={() => openModal(caseItem)}
													className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium text-xs sm:text-sm transition-colors duration-200"
												>
													<svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
													</svg>
													Читать подробнее
												</button>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>

					{/* Navigation Dots and Controls */}
					<div className="flex justify-center items-center mt-6 sm:mt-8 gap-4">
						<div className="flex gap-2">
							{cases.map((_, index) => (
								<button
									key={index}
									onClick={() => goToSlide(index)}
									className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${index === currentSlide
										? 'bg-ocean-400'
										: 'bg-ocean-200 hover:bg-ocean-300'
										}`}
								/>
							))}
						</div>
					</div>

					{/* Navigation Arrows */}
					<button
						onClick={prevSlide}
						className="absolute -left-2 lg:-left-16 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ocean-600 p-2 sm:p-3 lg:p-4 rounded-full shadow-xl transition-all duration-300 backdrop-blur-sm transform hover:shadow-2xl hover:shadow-ocean-500/25 z-10 opacity-100 -translate-x-1 sm:-translate-x-2"
					>
						<svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						onClick={nextSlide}
						className="absolute -right-2 lg:-right-16 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ocean-600 p-2 sm:p-3 lg:p-4 rounded-full shadow-xl transition-all duration-300 backdrop-blur-sm transform hover:shadow-2xl hover:shadow-ocean-500/25 z-10 opacity-100 translate-x-1 sm:translate-x-2"
					>
						<svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				{/* CTA */}
				<div className="text-center mt-16 sm:mt-20 lg:mt-24 px-4">
					<p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-6 sm:mb-8">
						Хотите получить такие же результаты?
					</p>
					<button
						onClick={(e) => {
							e.preventDefault()
							const targetElement = document.getElementById('booking')
							if (targetElement) {
								const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset
								const offsetPosition = elementPosition
								window.scrollTo({
									top: offsetPosition,
									behavior: 'smooth'
								})
							}
						}}
						className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-6 py-3 sm:px-10 sm:py-4 lg:px-12 lg:py-5 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 text-sm sm:text-base lg:text-lg font-light"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Записаться на консультацию
					</button>
				</div>
			</div>

			{/* Modal */}
			{selectedCase && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={closeModal}>
					<div
						className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header - фиксированная шапка */}
						<div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between rounded-t-xl sm:rounded-t-2xl">
							<div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
								<div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg font-medium">
									{String(selectedCase.display_order || 1).padStart(2, '0')}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-base sm:text-xl lg:text-2xl font-medium text-slate-700 break-words leading-5">
										{selectedCase.title}
									</h3>
									<div className="text-xs sm:text-sm text-ocean-600 font-medium mt-1">
										{selectedCase.duration}
									</div>
								</div>
							</div>
							<button
								onClick={closeModal}
								className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Modal Content - скроллируемая область */}
						<div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 sm:space-y-8 rounded-b-xl sm:rounded-b-2xl">
							{/* Problem */}
							<div>
								<h4 className="text-base sm:text-lg font-semibold text-red-600 mb-2 sm:mb-3">
									Проблема
								</h4>
								<div
									className="case-content text-sm sm:text-base text-slate-600 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.problem }}
								/>
							</div>

							{/* Solution */}
							<div>
								<h4 className="text-base sm:text-lg font-semibold text-ocean-600 mb-2 sm:mb-3">
									Решение
								</h4>
								<div
									className="case-content text-sm sm:text-base text-slate-700 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.solution }}
								/>
							</div>

							{/* Result */}
							<div>
								<h4 className="text-base sm:text-lg font-semibold text-green-600 mb-2 sm:mb-3">
									Результат
								</h4>
								<div
									className="case-content text-sm sm:text-base text-slate-700 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.result }}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}

export default Cases