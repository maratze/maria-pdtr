import React, { useState } from 'react'
import review1 from '../assets/images/review-1.png'
import review2 from '../assets/images/review-2.png'
import review3 from '../assets/images/review-3.png'
import review4 from '../assets/images/review-4.png'
import review5 from '../assets/images/review-5.png'
import review6 from '../assets/images/review-6.png'
import review7 from '../assets/images/review-7.png'
import review8 from '../assets/images/review-8.png'
import review9 from '../assets/images/review-9.png'
import review10 from '../assets/images/review-10.png'
import review11 from '../assets/images/review-11.png'
import review12 from '../assets/images/review-12.png'
import review13 from '../assets/images/review-13.png'
import review14 from '../assets/images/review-14.png'
import review15 from '../assets/images/review-15.png'
import review16 from '../assets/images/review-16.png'
import review17 from '../assets/images/review-17.png'
import review18 from '../assets/images/review-18.png'
import review19 from '../assets/images/review-19.png'
import review20 from '../assets/images/review-20.png'
import review21 from '../assets/images/review-21.png'
import review22 from '../assets/images/review-22.png'
import review23 from '../assets/images/review-23.png'
import review24 from '../assets/images/review-24.png'

const categories = [
	'Все',
	'Физическая боль',
	'Эмоциональные проблемы',
	'Финансовые блоки',
	'Отношения',
	'Карьера',
	'Здоровье'
]

const Testimonials = () => {
	const [visibleCount, setVisibleCount] = useState(3)
	const [activeCategory, setActiveCategory] = useState('Все')

	const testimonials = [
		{
			id: 1,
			problem: "Работа с эмоциональными блоками",
			image: review1,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 2,
			problem: "Боль в плечах, водянка, давление",
			image: review2,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 3,
			problem: "Мигрень, психоэмоциональная коррекция",
			image: review3,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 4,
			problem: "Психоэмоциональная коррекция",
			image: review4,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 5,
			problem: "Косоглазие у ребенка",
			image: review5,
			rating: 5,
			category: "Здоровье"
		},
		{
			id: 6,
			problem: "Страх моря",
			image: review6,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 7,
			problem: "Боль в руке",
			image: review7,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 8,
			problem: "Психоэмоциональная коррекция",
			image: review8,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 9,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: review9,
			rating: 5,
			category: "Финансовые блоки"
		},
		{
			id: 10,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: review10,
			rating: 5,
			category: "Финансовые блоки"
		},
		{
			id: 11,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: review11,
			rating: 5,
			category: "Финансовые блоки"
		},
		{
			id: 12,
			problem: "Эмоциональный блок на деньги, проявленность",
			image: review12,
			rating: 5,
			category: "Финансовые блоки"
		},
		{
			id: 13,
			problem: "Боль в шее",
			image: review13,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 14,
			problem: "Боль в спине",
			image: review14,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 15,
			problem: "Эмоции",
			image: review15,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 16,
			problem: "Эмоции",
			image: review1,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 17,
			problem: "Боль в ноге",
			image: review1,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 18,
			problem: "Последствия операции",
			image: review18,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 19,
			problem: "Невралгия",
			image: review19,
			rating: 5,
			category: "Физическая боль"
		},
		{
			id: 20,
			problem: "Психоэмоциональная коррекция",
			image: review20,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 21,
			problem: "Психоэмоциональная коррекция",
			image: review21,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 22,
			problem: "Эмоции",
			image: review22,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 23,
			problem: "Эмоции",
			image: review23,
			rating: 5,
			category: "Эмоциональные проблемы"
		},
		{
			id: 24,
			problem: "Эмоции",
			image: review24,
			rating: 5,
			category: "Эмоциональные проблемы"
		}
	]

	const filteredTestimonials = activeCategory === 'Все'
		? testimonials
		: testimonials.filter(testimonial => testimonial.category === activeCategory)

	const displayedTestimonials = filteredTestimonials.slice(0, visibleCount)

	return (
		<section id="testimonials" className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-ocean-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12 sm:mb-16">
					<h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-ocean-600 mb-3 sm:mb-4">
						Отзывы пациентов
					</h2>
					<p className="text-md md:text-lg text-slate-600 max-w-3xl mx-auto px-4">
						Что говорят люди, которые уже испытали на себе эффективность P-DTR метода
					</p>
				</div>

				{/* Category Tabs - Hidden on mobile */}
				<div className="hidden sm:flex flex-wrap justify-center gap-2 mb-8">
					{categories.map((category) => (
						<button
							key={category}
							onClick={() => {
								setActiveCategory(category)
								setVisibleCount(3) // Reset pagination when changing category
							}}
							className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${activeCategory === category
								? 'bg-ocean-600 text-white shadow-lg'
								: 'bg-white text-slate-600 hover:bg-ocean-50 hover:text-ocean-600 border border-slate-200'
								}`}
						>
							{category}
						</button>
					))}
				</div>

				{/* Category Select - Visible only on mobile */}
				<div className="sm:hidden mb-6">
					<select
						value={activeCategory}
						onChange={(e) => {
							setActiveCategory(e.target.value)
							setVisibleCount(3) // Reset pagination when changing category
						}}
						className="w-full px-4 py-3 rounded-xl text-sm font-medium bg-white text-slate-700 border-2 border-slate-200 focus:border-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-600/20 transition-all duration-300 appearance-none cursor-pointer"
						style={{
							backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232563eb'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
							backgroundRepeat: 'no-repeat',
							backgroundPosition: 'right 0.75rem center',
							backgroundSize: '1.25rem'
						}}
					>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>

				{/* Testimonials Grid or Empty State */}
				{filteredTestimonials.length === 0 ? (
					<div className="flex items-center justify-center">
						<div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-md border border-ocean-100 max-w-md mx-auto text-center">
							<div className="w-16 h-16 sm:w-20 sm:h-20 bg-ocean-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
								<svg className="w-8 h-8 sm:w-10 sm:h-10 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2 sm:mb-3">
								Отзывов пока нет
							</h3>
							<p className="text-sm sm:text-base text-slate-600 leading-relaxed">
								В категории <span className="font-semibold text-ocean-600">"{activeCategory}"</span> еще не добавлены отзывы
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
						{displayedTestimonials.map((testimonial) => (
							<div key={testimonial.id} className="group h-full">
								<div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
									{/* Review Image */}
									<div className="aspect-[4/5] bg-gradient-to-br from-ocean-100 to-slate-100 relative overflow-hidden flex-shrink-0">
										{testimonial.image ? (
											<img
												src={testimonial.image}
												alt={`Отзыв: ${testimonial.problem}`}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="text-center p-4 sm:p-6">
													<div className="w-12 h-12 sm:w-16 sm:h-16 bg-ocean-200 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
														<svg className="w-6 h-6 sm:w-8 sm:h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
														</svg>
													</div>
													<p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">{testimonial.problem}</p>
												</div>
											</div>
										)}

										{/* Overlay for hover effect */}
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
									</div>

									{/* Card footer */}
									<div className="p-3 sm:p-4 flex-1 flex items-start">
										<p className="text-sm font-medium text-slate-800 leading-relaxed">{testimonial.problem}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Show More Button */}
				{visibleCount < filteredTestimonials.length && (
					<div className="text-center mt-8 sm:mt-12">
						<button
							onClick={() => setVisibleCount(prev => prev + 3)}
							className="inline-flex items-center gap-2 bg-ocean-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 text-sm sm:text-base"
						>
							<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
							Показать еще отзывы
						</button>
					</div>
				)}
				{/* Stats */}
				<div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-1 sm:mb-2">150+</div>
						<div className="text-sm text-slate-600">Довольных пациентов</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-1 sm:mb-2">95%</div>
						<div className="text-sm text-slate-600">Успешных случаев</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-1 sm:mb-2">4.9</div>
						<div className="text-sm text-slate-600">Средняя оценка</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-1 sm:mb-2">3+</div>
						<div className="text-sm text-slate-600">Года практики</div>
					</div>
				</div>

				{/* Future reviews form teaser */}
				<div className="mt-12 sm:mt-16">
					<div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-ocean-100 max-w-2xl mx-auto">
						<div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
							<div className="flex-shrink-0 mx-auto sm:mx-0">
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-ocean-100 rounded-full flex items-center justify-center">
									<svg className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</div>
							</div>
							<div className="text-center sm:text-left flex-1">
								<h3 className="text-lg md:text-xl font-medium text-slate-800 mb-2">
									Хотите оставить отзыв?
								</h3>
								<p className="text-sm md:text-base text-slate-600 mb-3 sm:mb-4 leading-relaxed">
									Скоро здесь появится возможность оставлять отзывы прямо на сайте.
									А пока вы можете поделиться своими впечатлениями в личных сообщениях.
								</p>
								<div className="inline-flex items-center gap-2 bg-ocean-50 text-ocean-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm">
									<svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Скоро будет доступно
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Testimonials