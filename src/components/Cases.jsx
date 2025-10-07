import React, { useState } from 'react'

const Cases = () => {
	const [currentSlide, setCurrentSlide] = useState(0)
	const [selectedCase, setSelectedCase] = useState(null)

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % cases.length)
	}

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + cases.length) % cases.length)
	}

	const goToSlide = (index) => {
		setCurrentSlide(index)
	}

	const openModal = (caseItem) => {
		setSelectedCase(caseItem)
	}

	const closeModal = () => {
		setSelectedCase(null)
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

	return (
		<section id="cases" className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-800 via-slate-700 to-ocean-800 overflow-hidden">
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
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-6">
						Кейсы из практики
					</h2>
					<p className="text-md md:text-lg text-slate-200 max-w-3xl mx-auto">
						Реальные истории пациентов, которые восстановили здоровье с помощью P-DTR метода
					</p>
				</div>

				{/* Carousel Container */}
				<div className="relative max-w-5xl mx-auto">
					{/* Carousel */}
					<div className="relative overflow-hidden rounded-2xl">
						<div
							className="flex transition-transform duration-300 ease-in-out"
							style={{ transform: `translateX(-${currentSlide * 100}%)` }}
						>
							{cases.map((caseItem) => (
								<div key={caseItem.id} className="w-full flex-shrink-0">
									<div className="bg-white/95 backdrop-blur-sm border border-ocean-200/50 rounded-2xl p-6 lg:p-8 mx-4 shadow-lg">
										{/* Case Header with Number */}
										<div className="flex items-start gap-4 mb-6">
											<div className="flex-shrink-0 w-16 h-16 bg-ocean-600 text-white rounded-xl flex items-center justify-center text-2xl font-medium">
												{String(caseItem.id).padStart(2, '0')}
											</div>
											<div className="flex-1">
												<h3 className="text-xl lg:text-2xl font-medium text-slate-700">
													{caseItem.title}
												</h3>
												<div className="text-sm text-ocean-600 font-medium">
													{caseItem.duration}
												</div>
											</div>
										</div>

										{/* Problem Preview */}
										<div className="mb-6">
											<h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
												Проблема
											</h4>
											<p className="text-slate-600 leading-relaxed">
												{truncateText(caseItem.problem)}
											</p>
										</div>

										{/* Solution Preview */}
										<div className="mb-6">
											<h4 className="text-sm font-semibold text-ocean-600 uppercase tracking-wide mb-2">
												Решение
											</h4>
											<p className="text-slate-700 leading-relaxed">
												{truncateText(caseItem.solution)}
											</p>
										</div>

										{/* Result Preview */}
										<div className="mb-6">
											<h4 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
												Результат
											</h4>
											<p className="text-slate-700 leading-relaxed">
												{truncateText(caseItem.result)}
											</p>
										</div>

										{/* Read More Button */}
										<div className="pt-4 border-t border-slate-200">
											<button
												onClick={() => openModal(caseItem)}
												className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium text-sm transition-colors duration-200"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
												Читать подробнее
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Navigation Dots */}
					<div className="flex justify-center mt-8 gap-2">
						{cases.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide
									? 'bg-ocean-400'
									: 'bg-ocean-200 hover:bg-ocean-300'
									}`}
							/>
						))}
					</div>

					{/* Navigation Arrows */}
					<button
						onClick={prevSlide}
						className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ocean-600 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						onClick={nextSlide}
						className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ocean-600 p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</div>

				{/* CTA */}
				<div className="text-center mt-16">
					<p className="text-slate-200 mb-6">
						Хотите получить такой же результат?
					</p>
					<a
						href="https://t.me/maria_pdtr"
						target="_blank"
						className="inline-flex items-center gap-2 bg-ocean-600 text-white px-8 py-4 rounded-full hover:bg-ocean-500 transition-all duration-300 shadow-lg hover:shadow-ocean-500/25"
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
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
					<div
						className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-ocean-600 text-white rounded-xl flex items-center justify-center text-lg font-medium">
									{String(selectedCase.id).padStart(2, '0')}
								</div>
								<div>
									<h3 className="text-xl lg:text-2xl font-medium text-slate-700">
										{selectedCase.title}
									</h3>
									<div className="text-sm text-ocean-600 font-medium">
										{selectedCase.duration}
									</div>
								</div>
							</div>
							<button
								onClick={closeModal}
								className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-6 space-y-8">
							{/* Problem */}
							<div>
								<h4 className="text-lg font-semibold text-red-600 mb-3">
									Проблема
								</h4>
								<div
									className="text-slate-600 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.problem }}
								/>
							</div>

							{/* Solution */}
							<div>
								<h4 className="text-lg font-semibold text-ocean-600 mb-3">
									Решение
								</h4>
								<div
									className="text-slate-700 leading-relaxed"
									dangerouslySetInnerHTML={{ __html: selectedCase.solution }}
								/>
							</div>

							{/* Result */}
							<div>
								<h4 className="text-lg font-semibold text-green-600 mb-3">
									Результат
								</h4>
								<div
									className="text-slate-700 leading-relaxed"
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