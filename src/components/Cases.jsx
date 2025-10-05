import React from 'react'

const Cases = () => {
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
		<section id="cases" className="py-16 lg:py-24 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-ocean-600 mb-6">
						Кейсы из практики
					</h2>
					<p className="text-md md:text-lg text-slate-600 max-w-3xl mx-auto">
						Реальные истории пациентов, которые восстановили здоровье с помощью P-DTR метода
					</p>
				</div>

				{/* Cases Grid */}
				<div className="space-y-8 lg:space-y-12">
					{cases.map((caseItem, index) => (
						<div key={caseItem.id} className={`flex flex-col lg:flex-row items-start gap-8 lg:gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
							{/* Case Number & Duration */}
							<div className="flex-shrink-0 lg:w-48">
								<div className="bg-ocean-50 rounded-2xl p-6 text-center">
									<div className="text-4xl font-medium text-ocean-600 mb-2">
										{String(caseItem.id).padStart(2, '0')}
									</div>
									<div className="text-sm text-ocean-800 font-medium">
										{caseItem.duration}
									</div>
								</div>
							</div>

							{/* Case Content */}
							<div className="flex-1 bg-slate-50 rounded-2xl p-6 lg:p-8">
								<h3 className="text-xl lg:text-2xl font-medium text-slate-900 mb-6">
									{caseItem.title}
								</h3>

								<div className="space-y-6">
									{/* Problem */}
									<div>
										<h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
											Проблема
										</h4>
										<div
											className="text-slate-700 leading-relaxed"
											dangerouslySetInnerHTML={{ __html: caseItem.problem }}
										/>
									</div>

									{/* Solution */}
									<div>
										<h4 className="text-sm font-semibold text-ocean-600 uppercase tracking-wide mb-2">
											Решение
										</h4>
										<div
											className="text-slate-700 leading-relaxed"
											dangerouslySetInnerHTML={{ __html: caseItem.solution }}
										/>
									</div>

									{/* Result */}
									<div>
										<h4 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
											Результат
										</h4>
										<div
											className="text-slate-700 leading-relaxed"
											dangerouslySetInnerHTML={{ __html: caseItem.result }}
										/>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* CTA */}
				<div className="text-center mt-16">
					<p className="text-slate-600 mb-6">
						Хотите получить такой же результат?
					</p>
					<a
						href="https://t.me/maria_pdtr"
						target="_blank"
						className="inline-flex items-center gap-2 bg-ocean-600 text-white px-8 py-4 rounded-full hover:bg-ocean-700 transition-all duration-300 font-medium shadow-lg hover:shadow-ocean-500/25"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						Записаться на консультацию
					</a>
				</div>
			</div>
		</section>
	)
}

export default Cases