import React, { useState, useEffect } from 'react'
import { listApprovedReviews, getCategories } from '../lib/reviews'
import SectionHeader from './SectionHeader'
import SectionDescription from './SectionDescription'
import ReviewsForm from './ReviewsForm'

const Testimonials = () => {
	const [visibleCount, setVisibleCount] = useState(4)
	const [activeCategory, setActiveCategory] = useState('Все')
	const [categories, setCategories] = useState(['Все'])
	const [loadingCategories, setLoadingCategories] = useState(true)
	const [dynamicReviews, setDynamicReviews] = useState([])
	const [loadingReviews, setLoadingReviews] = useState(true)
	const [selectedImage, setSelectedImage] = useState(null) // For image popup

	// Load categories from database
	useEffect(() => {
		async function loadCategories() {
			setLoadingCategories(true)
			const { data, error } = await getCategories()
			if (!error && data) {
				const categoryNames = data.map(cat => cat.name)
				setCategories(['Все', ...categoryNames])
				// Set first category as active if it exists
				if (categoryNames.length > 0) {
					setActiveCategory('Все')
				}
			}
			setLoadingCategories(false)
		}
		loadCategories()
	}, [])

	// Load dynamic reviews from database
	useEffect(() => {
		async function load() {
			setLoadingReviews(true)
			const { data, error } = await listApprovedReviews()
			if (!error && data) {
				// Transform database reviews to match testimonial format
				const transformed = data.map(review => ({
					id: `db-${review.id}`,
					problem: review.message,
					name: review.name || 'Аноним',
					rating: review.rating,
					category: review.category || 'Все', // Use category from database
					image: review.photos && review.photos.length > 0 ? review.photos[0] : null,
					hasText: !!review.message,
					hasImage: review.photos && review.photos.length > 0,
					created_at: review.created_at,
					email: review.email
				}))
				setDynamicReviews(transformed)
			}
			setLoadingReviews(false)
		}
		load()
	}, [])

	// Combine static and dynamic reviews (only dynamic reviews now)
	const allTestimonials = [...dynamicReviews]

	const filteredTestimonials = activeCategory === 'Все'
		? allTestimonials
		: allTestimonials.filter(testimonial => testimonial.category === activeCategory)

	// Sort from newest to oldest (dynamic reviews have created_at, static don't)
	const sortedTestimonials = [...filteredTestimonials].sort((a, b) => {
		// Dynamic reviews with created_at come first (newest first)
		if (a.created_at && b.created_at) {
			return new Date(b.created_at) - new Date(a.created_at)
		}
		// If only one has created_at, it comes first
		if (a.created_at) return -1
		if (b.created_at) return 1
		// Static reviews keep their order
		return 0
	})

	const displayedTestimonials = sortedTestimonials.slice(0, visibleCount)

	return (
		<section id="testimonials" className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-ocean-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12 sm:mb-16">
					<SectionHeader title="Отзывы пациентов" />
					<SectionDescription text="Что говорят люди, которые уже испытали на себе эффективность P-DTR метода" />
				</div>

				{/* Categories Loading Preloader */}
				{loadingCategories ? (
					<div className="flex items-center justify-center mb-8 h-12">
						<div className="inline-flex items-center justify-center">
							<div className="w-8 h-8 border-3 border-slate-200 border-t-ocean-600 rounded-full animate-spin"></div>
						</div>
					</div>
				) : (
					<>
						{/* Category Tabs - Hidden on mobile */}
						<div className="hidden sm:flex flex-wrap justify-center gap-2 mb-8">
							{categories.map((category) => (
								<button
									key={category}
									onClick={() => {
										setActiveCategory(category)
										setVisibleCount(4) // Reset pagination when changing category
									}}
									className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-regular transition-all duration-300 ${activeCategory === category
										? 'bg-gradient-to-r from-ocean-600 to-ocean-600 text-white shadow-lg'
										: 'bg-white text-slate-900 hover:bg-ocean-50 hover:text-ocean-600 border border-slate-200'
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
									setVisibleCount(4) // Reset pagination when changing category
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
					</>
				)}

				{/* Testimonials Grid or Empty State */}
				{loadingReviews || loadingCategories ? (
					// Preloader
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="inline-flex items-center justify-center">
								<div className="w-12 h-12 border-4 border-slate-200 border-t-ocean-600 rounded-full animate-spin"></div>
							</div>
							<p className="text-slate-600 mt-4">Загрузка отзывов...</p>
						</div>
					</div>
				) : filteredTestimonials.length === 0 ? (
					<div className="flex items-center justify-center">
						<div className="p-8 sm:p-12 max-w-md mx-auto text-center">
							<div className="w-16 h-16 sm:w-20 sm:h-20 bg-ocean-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
								<svg className="w-8 h-8 sm:w-10 sm:h-10 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
							</div>
							<h3 className="text-lg sm:text-xl font-regular text-slate-700 mb-2 sm:mb-3">
								Отзывов пока нет
							</h3>
							<p className="text-sm sm:text-base text-slate-600 leading-relaxed">
								В категории <br /><span className="font-medium text-ocean-600">"{activeCategory}"</span>
							</p>
						</div>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
							{displayedTestimonials.map((testimonial) => (
								<div key={testimonial.id} className="group h-full">
									<div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform  h-full flex flex-col">

										{/* CASE 1: Text + Image - show text with image link */}
										{testimonial.hasText && testimonial.hasImage ? (
											<div className="p-6 flex-1 flex flex-col">
												{/* Stars */}
												<div className="flex items-center gap-1 mb-3">
													{[...Array(testimonial.rating)].map((_, i) => (
														<svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
															<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
														</svg>
													))}
												</div>

												{/* Message */}
												<p className="text-sm text-slate-700 leading-relaxed mb-4 flex-1">{testimonial.problem}</p>

												{/* View Image Button */}
												<button
													onClick={() => setSelectedImage(testimonial.image)}
													className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium text-sm mb-4 transition-colors"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													Просмотреть фото
												</button>

												{/* Author & Date - only if name exists */}
												{testimonial.name && (
													<div className="pt-3 border-t border-slate-100">
														<div className="flex items-center gap-2">
															<div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
																<svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
																</svg>
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-slate-900 truncate">{testimonial.name}</p>
																{testimonial.created_at && (
																	<p className="text-xs text-slate-500">
																		{new Date(testimonial.created_at).toLocaleDateString('ru-RU', {
																			year: 'numeric',
																			month: 'short',
																			day: 'numeric'
																		})}
																	</p>
																)}
															</div>
														</div>
													</div>
												)}
											</div>
										) : testimonial.hasImage && !testimonial.hasText ? (
											// CASE 2: Only Image - show image with author, date, rating below
											<>
												<div className="aspect-[4/5] bg-gradient-to-br from-ocean-100 to-slate-100 relative overflow-hidden flex-shrink-0">
													<img
														src={testimonial.image}
														alt={`Отзыв: ${testimonial.name}`}
														className="w-full h-full object-cover cursor-pointer"
														onClick={() => setSelectedImage(testimonial.image)}
													/>
													<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
												</div>

												{/* Card footer */}
												<div className="p-4 flex-1 flex flex-col">
													{/* Stars */}
													<div className="flex items-center gap-1 mb-3">
														{[...Array(testimonial.rating)].map((_, i) => (
															<svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
																<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
															</svg>
														))}
													</div>

													{/* Author & Date - only if name exists */}
													{testimonial.name && (
														<div className="pt-3 border-t border-slate-100">
															<div className="flex items-center gap-2">
																<div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
																	<svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
																	</svg>
																</div>
																<div className="flex-1 min-w-0">
																	<p className="text-sm font-medium text-slate-900 truncate">{testimonial.name}</p>
																	{testimonial.created_at && (
																		<p className="text-xs text-slate-500">
																			{new Date(testimonial.created_at).toLocaleDateString('ru-RU', {
																				year: 'numeric',
																				month: 'short',
																				day: 'numeric'
																			})}
																		</p>
																	)}
																</div>
															</div>
														</div>
													)}
												</div>
											</>
										) : (
											// CASE 3: Only Text - show text with author, date, rating
											<div className="p-6 flex-1 flex flex-col">
												{/* Stars */}
												<div className="flex items-center gap-1 mb-3">
													{[...Array(testimonial.rating)].map((_, i) => (
														<svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
															<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
														</svg>
													))}
												</div>

												{/* Message */}
												<p className="text-sm text-slate-700 leading-relaxed mb-4 flex-1">{testimonial.problem}</p>

												{/* Author & Date - only if name exists */}
												{testimonial.name && (
													<div className="pt-3 border-t border-slate-100">
														<div className="flex items-center gap-2">
															<div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
																<svg className="w-4 h-4 text-ocean-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
																</svg>
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-slate-900 truncate">{testimonial.name}</p>
																{testimonial.created_at && (
																	<p className="text-xs text-slate-500">
																		{new Date(testimonial.created_at).toLocaleDateString('ru-RU', {
																			year: 'numeric',
																			month: 'short',
																			day: 'numeric'
																		})}
																	</p>
																)}
															</div>
														</div>
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Image Popup Modal */}
						{selectedImage && (
							<div
								className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-2"
								onClick={() => setSelectedImage(null)}
							>
								<div
									className="relative w-full max-w-[400px]"
									onClick={(e) => e.stopPropagation()}
								>
									<button
										onClick={() => setSelectedImage(null)}
										className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
									>
										<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
									<img
										src={selectedImage}
										alt="Full review"
										className="w-full h-auto rounded-lg"
									/>
								</div>
							</div>
						)}
					</>
				)}

				{/* Show More Button */}
				{visibleCount < filteredTestimonials.length && (
					<div className="text-center mt-8 sm:mt-12">
						<button
							onClick={() => setVisibleCount(prev => prev + 4)}
							className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 text-sm sm:text-base"
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
						<div className="text-3xl lg:text-4xl font-regular text-ocean-600 mb-1 sm:mb-2">150+</div>
						<div className="text-base text-slate-600">Довольных пациентов</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-regular text-ocean-600 mb-1 sm:mb-2">95%</div>
						<div className="text-base text-slate-600">Успешных случаев</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-regular text-ocean-600 mb-1 sm:mb-2">4.9</div>
						<div className="text-base text-slate-600">Средняя оценка</div>
					</div>
					<div className="text-center">
						<div className="text-3xl lg:text-4xl font-regular text-ocean-600 mb-1 sm:mb-2">3+</div>
						<div className="text-base text-slate-600">Года практики</div>
					</div>
				</div>

				{/* Review Form */}
				<div className="mt-12 sm:mt-16 text-center">
					<ReviewsForm onSubmitted={() => {
						// Reload reviews when a new one is submitted
						async function reload() {
							const { data, error } = await listApprovedReviews()
							if (!error && data) {
								const transformed = data.map(review => ({
									id: `db-${review.id}`,
									problem: review.message,
									name: review.name || 'Аноним',
									rating: review.rating,
									category: 'Все',
									image: review.photos && review.photos.length > 0 ? review.photos[0] : null,
									hasText: !!review.message,
									hasImage: review.photos && review.photos.length > 0,
									created_at: review.created_at,
									email: review.email
								}))
								setDynamicReviews(transformed)
							}
						}
						reload()
					}} />
				</div>
			</div>
		</section>
	)
}

export default Testimonials