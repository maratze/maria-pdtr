import React, { useState, useEffect } from 'react'
import review1 from '../assets/images/review-1.png'

const Testimonials = () => {
	const [currentSlide, setCurrentSlide] = useState(0)

	const testimonials = [
		{
			id: 1,
			problem: "Работа с эмоциональными блоками",
			image: review1,
			rating: 5
		},
		{
			id: 2,
			problem: "Боль в плечах, водянка, давление",
			image: null,
			rating: 5
		},
		{
			id: 3,
			problem: "Мигрень, психоэмоциональная коррекция",
			image: null,
			rating: 5
		},
		{
			id: 4,
			problem: "Психоэмоциональная коррекция",
			image: null,
			rating: 5
		},
		{
			id: 5,
			problem: "Косоглазие у ребенка",
			image: null,
			rating: 5
		},
		{
			id: 6,
			problem: "Страх моря",
			image: null,
			rating: 5
		},
		{
			id: 7,
			problem: "Боль в руке",
			image: null,
			rating: 5
		},
		{
			id: 8,
			problem: "Психоэмоциональная коррекция",
			image: null,
			rating: 5
		},
		{
			id: 9,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: null,
			rating: 5
		},
		{
			id: 10,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: null,
			rating: 5
		},
		{
			id: 11,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: null,
			rating: 5
		},
		{
			id: 12,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: null,
			rating: 5
		},
		{
			id: 13,
			problem: "Боль в шее",
			image: null,
			rating: 5
		},
		{
			id: 14,
			problem: "Боль в спине",
			image: null,
			rating: 5
		},
		{
			id: 15,
			problem: "Эмоции",
			image: null,
			rating: 5
		},
		{
			id: 16,
			problem: "Эмоции",
			image: null,
			rating: 5
		},
		{
			id: 17,
			problem: "Боль в ноге",
			image: null,
			rating: 5
		},
		{
			id: 18,
			problem: "Последствия операции",
			image: null,
			rating: 5
		},
		{
			id: 19,
			problem: "Невралгия",
			image: null,
			rating: 5
		},
		{
			id: 20,
			problem: "Психоэмоциональная коррекция",
			image: null,
			rating: 5
		},
		{
			id: 21,
			problem: "Эмоции",
			image: null,
			rating: 5
		},
		{
			id: 22,
			problem: "Эмоции",
			image: null,
			rating: 5
		}
	]

	const itemsPerPage = 3
	const totalSlides = Math.ceil(testimonials.length / itemsPerPage)

	// Auto-slide functionality
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % totalSlides)
		}, 5000) // Change slide every 5 seconds

		return () => clearInterval(interval)
	}, [totalSlides])

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % totalSlides)
	}

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
	}

	const getCurrentTestimonials = () => {
		const startIndex = currentSlide * itemsPerPage
		return testimonials.slice(startIndex, startIndex + itemsPerPage)
	}

	return (
		<section id="testimonials" className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-ocean-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-ocean-600 mb-6">
						Отзывы пациентов
					</h2>
					<p className="text-md md:text-lg text-slate-600 max-w-3xl mx-auto">
						Что говорят люди, которые уже испытали на себе эффективность P-DTR метода
					</p>
				</div>

				{/* Testimonials Carousel */}
				<div className="relative">
					{/* Navigation Arrows */}
					<button
						onClick={prevSlide}
						className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-ocean-50 text-ocean-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
					>
						<svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<button
						onClick={nextSlide}
						className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-ocean-50 text-ocean-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
					>
						<svg className="w-6 h-6 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>

					{/* Testimonials Container */}
					<div className="overflow-hidden">
						<div
							className="flex transition-transform duration-500 ease-in-out"
							style={{ transform: `translateX(-${currentSlide * 100}%)` }}
						>
							{Array.from({ length: totalSlides }).map((_, slideIndex) => (
								<div key={slideIndex} className="w-full flex-shrink-0">
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
										{testimonials
											.slice(slideIndex * itemsPerPage, (slideIndex + 1) * itemsPerPage)
											.map((testimonial) => (
												<div key={testimonial.id} className="group">
													<div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
														{/* Review Image */}
														<div className="aspect-[4/5] bg-gradient-to-br from-ocean-100 to-slate-100 relative overflow-hidden">
															{testimonial.image ? (
																<img
																	src={testimonial.image}
																	alt={`Отзыв: ${testimonial.problem}`}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="absolute inset-0 flex items-center justify-center">
																	<div className="text-center p-6">
																		<div className="w-16 h-16 bg-ocean-200 rounded-full flex items-center justify-center mb-4 mx-auto">
																			<svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																			</svg>
																		</div>
																		<p className="text-sm font-medium text-slate-700 leading-relaxed">{testimonial.problem}</p>
																	</div>
																</div>
															)}

															{/* Overlay for hover effect */}
															<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>

															{/* Review badge */}
															<div className="absolute top-4 left-4 bg-ocean-600 text-white text-xs px-3 py-1 rounded-full font-medium">
																{testimonial.image ? 'Отзыв' : 'Скриншот отзыва'}
															</div>
														</div>

														{/* Card footer */}
														<div className="p-4">
															{/* Problem info */}
															<div className="mb-3">
																<p className="text-sm font-medium text-slate-800 leading-relaxed">{testimonial.problem}</p>
															</div>

															<div className="flex items-center justify-between">
																<div className="flex items-center gap-1">
																	{[...Array(testimonial.rating)].map((_, i) => (
																		<svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
																			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
																		</svg>
																	))}
																</div>
																<span className="text-xs text-slate-500 font-medium">
																	Проверенный отзыв
																</span>
															</div>
														</div>
													</div>
												</div>
											))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Dots Navigation */}
					<div className="flex justify-center mt-8 space-x-2">
						{Array.from({ length: totalSlides }).map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentSlide(index)}
								className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
									? 'bg-ocean-600 scale-125'
									: 'bg-ocean-200 hover:bg-ocean-300'
									}`}
							/>
						))}
					</div>
				</div>

				{/* Stats */}
				<div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-medium text-ocean-600 mb-2">100+</div>
						<div className="text-sm text-slate-600">Довольных пациентов</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-medium text-ocean-600 mb-2">97%</div>
						<div className="text-sm text-slate-600">Успешных случаев</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-medium text-ocean-600 mb-2">4.95</div>
						<div className="text-sm text-slate-600">Средняя оценка</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-medium text-ocean-600 mb-2">3+</div>
						<div className="text-sm text-slate-600">Года практики</div>
					</div>
				</div>

				{/* Future reviews form teaser */}
				{/* <div className="mt-16 text-center">
					<div className="bg-white rounded-2xl p-8 shadow-lg border border-ocean-100">
						<h3 className="text-xl font-bold text-slate-700 mb-4">
							Хотите оставить отзыв?
						</h3>
						<p className="text-slate-600 mb-6">
							В скором времени здесь появится возможность оставлять отзывы прямо на сайте
						</p>
						<div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-full font-medium">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Скоро будет доступно
						</div>
					</div>
				</div> */}
			</div>
		</section>
	)
}

export default Testimonials