import React, { useState, useEffect } from 'react'
import SectionHeader from './SectionHeader'
import SectionDescription from './SectionDescription'

const Cases = () => {
	const [currentSlide, setCurrentSlide] = useState(0) // Логический индекс для точек навигации
	const [position, setPosition] = useState(3) // Физическая позиция (начинаем со второй копии)
	const [selectedCase, setSelectedCase] = useState(null)
	const [isHovered, setIsHovered] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [isManualNavigation, setIsManualNavigation] = useState(false) // Флаг для ручной навигации
	const [isMobile, setIsMobile] = useState(false)

	// Отслеживание размера экрана
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 640)
		}
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	const nextSlide = () => {
		if (isTransitioning) return
		setIsTransitioning(true)

		setPosition(prev => prev + 1)

		setTimeout(() => setIsTransitioning(false), 300)
	}

	const prevSlide = () => {
		if (isTransitioning) return
		setIsTransitioning(true)

		setPosition(prev => prev - 1)

		setTimeout(() => setIsTransitioning(false), 300)
	}

	const goToSlide = (index) => {
		if (isTransitioning) return
		setIsTransitioning(true)
		setIsManualNavigation(true)

		// Используем вторую копию для точек навигации
		setCurrentSlide(index)
		setPosition(index + cases.length) // Вторая копия: позиции 3, 4, 5

		setTimeout(() => {
			setIsTransitioning(false)
			setIsManualNavigation(false)
		}, 300)
	}

	const openModal = (caseItem) => {
		setSelectedCase(caseItem)
		document.body.style.overflow = 'hidden'
	}

	const closeModal = () => {
		setSelectedCase(null)
		document.body.style.overflow = 'unset'
	}

	const truncateText = (text, limit = 120) => {
		const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
		if (plainText.length <= limit) return plainText
		return plainText.substring(0, limit) + '...'
	}
	const cases = [
		{
			id: 1,
			title: "Проработка страха одиночества",
			problem: "<em>\"Я боюсь остаться одна навсегда\"</em> — сказала мне на консультации Алена.<br/><br/>Постоянный страх одиночества мешал ей строить здоровые отношения. Каждое знакомство заканчивалось неудачей из-за внутреннего напряжения и ожидания отвержения.",
			solution: "Через метод P-DTR я нашла эмоциональные блоки, которые хранились в её теле:<br/><br/>• <strong>Грудная клетка</strong> — боль от первого расставания<br/>• <strong>Живот</strong> — страх отвержения, который тянулся из детства<br/>• <strong>Плечи</strong> — хроническое напряжение от постоянной готовности к защите<br/><br/>Работали с каждой зоной отдельно, восстанавливая нормальную работу рецепторов и освобождая заблокированные эмоции.",
			result: "После работы Алена почувствовала лёгкость в теле и душе:<br/><br/>• Исчез постоянный страх одиночества<br/>• Появилась уверенность в общении<br/>• Через месяц встретила человека, который ценит её<br/>• Научилась строить отношения без страха отвержения<br/><br/><em>\"Я больше не боюсь быть собой в отношениях\"</em> — говорит Алена сейчас.",
			duration: "6 сеансов"
		},
		{
			id: 2,
			title: "Мигрень: связь с эмоциональными блоками",
			problem: "Девушка 30 лет обратилась с запросом по мигрени. Мигрень наблюдается с 6 лет — практически всю сознательную жизнь.<br/><br/>Особенности случая:<br/>• Анамнез не выявил травм головы или шеи до 6 лет<br/>• В 9 лет была травма лба<br/>• С началом месячных мигрень \"привязалась\" к циклу<br/>• Недавняя операция на яичнике и другие \"женские\" проблемы<br/><br/>Мышцы шеи и тела сильные, физических причин для такой клиники не было. Клиентка не могла вспомнить эмоциональных переживаний в детстве.",
			solution: "Включился мой внутренний следователь 🔍<br/><br/>Совместно с мануально-мышечным тестированием вышли на ключевую эмоцию:<br/>• <strong>Возраст:</strong> 5 лет<br/>• <strong>Триггер:</strong> отец<br/>• <strong>Событие:</strong> уход отца из семьи<br/><br/>В возрасте 5 лет клиентка пережила уход отца, сопровождавшийся сильным страхом и эмоциональным стрессом. Стресс был настолько сильным, что нервная система заблокировала это событие из памяти.<br/><br/>Провели одну из самых тяжелых психоэмоциональных коррекций — вместе со слезами на глазах.",
			result: "Спустя неделю после сеанса:<br/><br/>• <strong>Мигрени полностью исчезли</strong><br/>• Нормализовался менструальный цикл<br/>• Улучшилось общее эмоциональное состояние<br/>• Клиентка смогла вспомнить и проработать детскую травму<br/><br/><em>\"Я не могла поверить, что боль, которая мучила меня 24 года, ушла за один сеанс. Оказывается, тело помнило то, что забыл разум.\"</em>",
			duration: "1 сеанс"
		},
		{
			id: 3,
			title: "Повышенная чувствительность к свету",
			problem: "Клиентка жаловалась на сильный дискомфорт от света:<br/><br/>• Повышенная чувствительность к естественному освещению<br/>• Дискомфорт при нахождении на улице в светлое время суток<br/>• Избегание искусственного освещения дома<br/>• Постоянное ношение солнцезащитных очков<br/><br/>Проблема серьезно ограничивала качество жизни — клиентка практически не могла находиться в нормально освещенных помещениях.",
			solution: "С помощью метода P-DTR мы вышли на истинную причину такой реакции на свет:<br/><br/><strong>Найденная проблема:</strong> дисфункция в зоне носа, связанная с ранее перенесенной травмой.<br/><br/><strong>Механизм нарушения:</strong><br/>• Травма повлияла на <em>тройничный нерв</em>, связанный с чувствительностью лица и глаз<br/>• Нарушилась обработка световых сигналов в нервной системе<br/>• Система адаптации к внешним раздражителям дала сбой<br/>• Обычный свет стал восприниматься как чрезмерно яркий<br/><br/>Работали с восстановлением нормальной функции рецепторов в носовой области.",
			result: "После коррекции дисфункции:<br/><br/>• Чувствительность к свету нормализовалась<br/>• Клиентка смогла находиться на улице без дискомфорта<br/>• Вернулась к использованию обычного освещения дома<br/>• Исчезла необходимость постоянно носить солнцезащитные очки<br/>• Значительно улучшилось качество жизни<br/><br/><em>\"Я забыла, каково это — видеть мир нормально. Теперь я могу наслаждаться солнечными днями!\"</em><br/><br/>Этот случай демонстрирует, как скрытые травмы могут влиять на восприятие окружающей среды.",
			duration: "4 сеанса"
		}
	]

	// Создаем минимальный расширенный массив для бесконечной прокрутки (best practice)
	const getExtendedCases = () => {
		return [...cases, ...cases, ...cases] // 3 копии - минимум для плавности
	}

	const extendedCases = getExtendedCases()

	// Синхронизация currentSlide с position (только для автоматической прокрутки)
	useEffect(() => {
		if (!isManualNavigation) {
			// Для 3 копий: позиция 3,4,5 соответствует слайдам 0,1,2
			const slideIndex = position - cases.length
			if (slideIndex >= 0 && slideIndex < cases.length) {
				setCurrentSlide(slideIndex)
			}
		}
	}, [position, cases.length, isManualNavigation])

	// Best practice: мгновенный сброс позиции для бесконечной прокрутки
	useEffect(() => {
		if (!isTransitioning && !isManualNavigation) {
			// Когда доходим до последней копии - перепрыгиваем к эквивалентной позиции в средней копии
			if (position >= extendedCases.length - cases.length) {
				const equivalentPosition = position - cases.length
				setPosition(equivalentPosition)
			}
			// Когда доходим до первой копии - перепрыгиваем к эквивалентной позиции в средней копии
			else if (position < cases.length) {
				const equivalentPosition = position + cases.length
				setPosition(equivalentPosition)
			}
		}
	}, [position, isTransitioning, isManualNavigation, cases.length, extendedCases.length])

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
					className="relative max-w-6xl mx-auto group"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					{/* Carousel */}
					<div className="relative rounded-2xl">
						<div
							className="flex transition-transform duration-300 ease-in-out"
							style={{
								transform: isMobile
									? `translateX(calc(-${position * 92}% + 4%))`
									: `translateX(calc(-${position * 80}% + 10%))`
							}}
						>
							{extendedCases.map((caseItem, index) => {
								// Активен слайд на позиции position
								const isActive = index === position
								// Создаем уникальный ключ для избежания проблем с дублированными элементами
								const uniqueKey = `${caseItem.id}-${Math.floor(index / cases.length)}-${index}`
								return (
									<div key={uniqueKey} className="w-[92%] sm:w-4/5 flex-shrink-0 px-2 sm:px-4">
										<div className={`bg-white/95 backdrop-blur-sm border border-ocean-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 ${isActive
											? 'scale-100 opacity-100'
											: 'scale-95 opacity-60'
											}`}>
											{/* Case Header with Number */}
											<div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
												<div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-medium">
													{String(caseItem.id).padStart(2, '0')}
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
												<p className="text-sm sm:text-base text-slate-600 leading-relaxed">
													{truncateText(caseItem.problem, isMobile ? 100 : 120)}
												</p>
											</div>

											{/* Solution Preview */}
											<div className="mb-4 sm:mb-6">
												<h4 className="text-xs sm:text-sm font-medium text-ocean-600 uppercase tracking-wide mb-2">
													Решение
												</h4>
												<p className="text-sm sm:text-base text-slate-700 leading-relaxed">
													{truncateText(caseItem.solution, isMobile ? 100 : 120)}
												</p>
											</div>

											{/* Result Preview */}
											<div className="mb-4 sm:mb-6">
												<h4 className="text-xs sm:text-sm font-medium text-green-600 uppercase tracking-wide mb-2">
													Результат
												</h4>
												<p className="text-sm sm:text-base text-slate-700 leading-relaxed">
													{truncateText(caseItem.result, isMobile ? 100 : 120)}
												</p>
											</div>

											{/* Read More Button */}
											<div className="pt-3 sm:pt-4 border-t border-slate-200">
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
						className={`absolute left-0 sm:left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white hover:scale-110 text-ocean-600 p-2 sm:p-3 lg:p-4 rounded-full shadow-xl transition-all duration-300 backdrop-blur-sm transform hover:shadow-2xl hover:shadow-ocean-500/25 z-10 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-100 -translate-x-1 sm:-translate-x-2'
							}`}
					>
						<svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						onClick={nextSlide}
						className={`absolute right-0 sm:right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white hover:scale-110 text-ocean-600 p-2 sm:p-3 lg:p-4 rounded-full shadow-xl transition-all duration-300 backdrop-blur-sm transform hover:shadow-2xl hover:shadow-ocean-500/25 z-10 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-1 sm:translate-x-2'
							}`}
					>
						<svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				{/* CTA */}
				<div className="text-center mt-12 sm:mt-16 px-4">
					<p className="text-sm sm:text-base text-slate-200 mb-4 sm:mb-6">
						Хотите получить такие же результаты?
					</p>
					<a
						href="https://t.me/maria_pdtr"
						target="_blank"
						className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-ocean-600 text-white px-4 py-3 sm:px-8 sm:py-4 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25 text-sm sm:text-base font-light"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Записаться на консультацию
					</a>
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
									{String(selectedCase.id).padStart(2, '0')}
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
									className="text-sm sm:text-base text-slate-600 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.problem }}
								/>
							</div>

							{/* Solution */}
							<div>
								<h4 className="text-base sm:text-lg font-semibold text-ocean-600 mb-2 sm:mb-3">
									Решение
								</h4>
								<div
									className="text-sm sm:text-base text-slate-700 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.solution }}
								/>
							</div>

							{/* Result */}
							<div>
								<h4 className="text-base sm:text-lg font-semibold text-green-600 mb-2 sm:mb-3">
									Результат
								</h4>
								<div
									className="text-sm sm:text-base text-slate-700 leading-relaxed"
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