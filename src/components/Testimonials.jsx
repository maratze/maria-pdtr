import React from 'react'

const Testimonials = () => {
	const testimonials = [
		{
			id: 1,
			name: "Анна Петрова",
			problem: "Хронические головные боли",
			image: "/api/placeholder/400/500", // временная заглушка
			rating: 5
		},
		{
			id: 2,
			name: "Михаил Сидоров",
			problem: "Боли в спине",
			image: "/api/placeholder/400/500", // временная заглушка
			rating: 5
		},
		{
			id: 3,
			name: "Елена Козлова",
			problem: "Восстановление после травмы",
			image: "/api/placeholder/400/500", // временная заглушка
			rating: 5
		},
		{
			id: 4,
			name: "Дмитрий Волков",
			problem: "Нарушения сна",
			image: "/api/placeholder/400/500", // временная заглушка
			rating: 5
		},
		{
			id: 5,
			name: "Мария Новикова",
			problem: "Постуральные нарушения",
			image: "/api/placeholder/400/500", // временная заглушка
			rating: 5
		},
		{
			id: 6,
			name: "Алексей Морозов",
			problem: "Спортивная травма",
			image: "/api/placeholder/400/500", // временная заглушка
			rating: 5
		}
	]

	return (
		<section id="testimonials" className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-ocean-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
						Отзывы пациентов
					</h2>
					<p className="text-lg text-slate-600 max-w-3xl mx-auto">
						Что говорят люди, которые уже испытали на себе эффективность P-DTR метода
					</p>
				</div>

				{/* Testimonials Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
					{testimonials.map((testimonial) => (
						<div key={testimonial.id} className="group">
							<div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
								{/* Screenshot placeholder */}
								<div className="aspect-[4/5] bg-gradient-to-br from-ocean-100 to-slate-100 relative overflow-hidden">
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="text-center p-6">
											<div className="w-16 h-16 bg-ocean-200 rounded-full flex items-center justify-center mb-4 mx-auto">
												<svg className="w-8 h-8 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
											<h3 className="font-semibold text-slate-800 mb-1">{testimonial.name}</h3>
											<p className="text-sm text-slate-600">{testimonial.problem}</p>
										</div>
									</div>

									{/* Overlay for future screenshot */}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>

									{/* Screenshot coming soon badge */}
									<div className="absolute top-4 left-4 bg-ocean-600 text-white text-xs px-3 py-1 rounded-full font-medium">
										Скриншот отзыва
									</div>
								</div>

								{/* Card footer */}
								<div className="p-4">
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

				{/* Stats */}
				<div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-2">150+</div>
						<div className="text-sm text-slate-600">Довольных пациентов</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-2">95%</div>
						<div className="text-sm text-slate-600">Успешных случаев</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-2">4.9</div>
						<div className="text-sm text-slate-600">Средняя оценка</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-bold text-ocean-600 mb-2">3+</div>
						<div className="text-sm text-slate-600">Года практики</div>
					</div>
				</div>

				{/* Future reviews form teaser */}
				<div className="mt-16 text-center">
					<div className="bg-white rounded-2xl p-8 shadow-lg border border-ocean-100">
						<h3 className="text-xl font-bold text-slate-900 mb-4">
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
				</div>
			</div>
		</section>
	)
}

export default Testimonials