import React from 'react';
import Accordion from './Accordion';

const PDTRMethod = () => {
	const accordionItems = [
		{
			title: "Что такое P-DTR?",
			content: (
				<div>
					<div className="mb-6">
						<h4 className="font-medium text-ocean-600 mb-3">Суть метода</h4>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>
									Это неврологическая рефлексогенная система лечения, основанная на принципах
									неврологии, биомеханики, нейрофизиологии и анатомии.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>
									Метод работает непосредственно с центральной нервной системой, фокусируясь
									на роли сенсорных нервных окончаний (рецепторов) в функционировании организма.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>
									Основная цель — восстановить оптимальную рефлекторную деятельность нервной
									системы и устранить искаженные сигналы от рецепторов.
								</p>
							</li>
						</ul>
					</div>
					<div className="bg-ocean-50 p-4 rounded-lg">
						<p className="text-sm text-ocean-700">
							<strong>P-DTR</strong> (Proprioceptive Deep Tendon Reflex) — это революционный подход
							к восстановлению здоровья через коррекцию нарушений в работе нервной системы.
						</p>
					</div>
				</div>
			)
		},
		{
			title: "Как работает метод?",
			content: (
				<div>
					<div className="mb-6">
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<p>
									Коррекция методом включает диагностику с помощью мануально-мышечного
									тестирования и визуальной оценки.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>
									Метод позволяет найти дисфункциональные рецепторы и "перезагрузить"
									искаженную информацию в нервной системе.
								</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>
									Используется способность мышц рефлекторно сокращаться в ответ
									на раздражение проприорецепторов.
								</p>
							</li>
						</ul>
					</div>
					<div className="bg-ocean-50 p-4 rounded-lg">
						<p className="text-sm text-ocean-700">
							<strong>Ключевой момент:</strong> P-DTR работает на уровне рефлексов, восстанавливая
							правильную связь между рецепторами и центральной нервной системой.
						</p>
					</div>
				</div>
			)
		},
		{
			title: "Какие проблемы решает?",
			content: (
				<div>
					<div className="mb-6">
						<p className="mb-4 text-gray-600">P-DTR эффективен при лечении широкого спектра проблем, включая:</p>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Острые эмоциональные состояния, расстройства адаптации</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Проработка страхов, фобий</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Заболевания позвоночника и суставов (остеохондроз, межпозвонковые грыжи, артриты и др.)</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Последствия травм и операций</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Неврологические нарушения (головные боли, вегето-сосудистая дистония)</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Болезни внутренних органов</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Проблемы у детей (последствия родовых травм, сколиоз и др.)</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
								<p>Гинекологические и урологические проблемы</p>
							</li>
						</ul>
					</div>
					<div className="bg-ocean-50 p-4 rounded-lg">
						<p className="text-sm text-ocean-700">
							<strong>Важно:</strong> P-DTR работает не только с симптомами, но и с первопричиной проблем,
							обеспечивая комплексный подход к восстановлению здоровья.
						</p>
					</div>
				</div>
			)
		},
		{
			title: "Кому подходит?",
			content: (
				<div>
					<p className="mb-4">
						Метод P-DTR подходит людям различного возраста и с разными запросами:
					</p>
					<ul className="list-disc list-inside space-y-2">
						<li className="flex items-start gap-3">
							<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>Взрослым с хроническими болями и дискомфортом</p>
						</li>

						<li className="flex items-start gap-3">
							<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>Детям с нарушениями развития и поведенческими проблемами</p>
						</li>
						<li className="flex items-start gap-3">
							<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>Спортсменам для улучшения производительности</p>
						</li>
						<li className="flex items-start gap-3">
							<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>Людям, пережившим травмы и стресс</p>
						</li>
						<li className="flex items-start gap-3">
							<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>Тем, кто хочет улучшить общее самочувствие и энергию</p>
						</li>
					</ul>
					<p className="mt-4 text-sm text-gray-600">
						Метод безопасен и может применяться как самостоятельно, так и в комплексе
						с другими видами терапии.
					</p>
					<div className="bg-ocean-50 p-4 rounded-lg mt-6">
						<p className="text-sm text-ocean-700">
							<strong>Важно:</strong> Не подходит в двух основных случаях - врожденные и органические изменения. Рекомендуется проконсультироваться со специалистом.
						</p>
					</div>
				</div>
			)
		},
		{
			title: "Преимущества P-DTR",
			content: (
				<div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="bg-ocean-50 p-4 rounded-lg">
							<h4 className="font-semibold text-ocean-600 mb-2">Быстрые результаты</h4>
							<p className="text-sm">Многие клиенты отмечают улучшения уже после первого сеанса</p>
						</div>
						<div className="bg-ocean-50 p-4 rounded-lg">
							<h4 className="font-semibold text-ocean-600 mb-2">Работа с первопричиной</h4>
							<p className="text-sm">Метод находит и устраняет корень проблемы, а не только симптомы</p>
						</div>
						<div className="bg-ocean-50 p-4 rounded-lg">
							<h4 className="font-semibold text-ocean-600 mb-2">Безопасность</h4>
							<p className="text-sm">Неинвазивный подход без побочных эффектов</p>
						</div>
						<div className="bg-ocean-50 p-4 rounded-lg">
							<h4 className="font-semibold text-ocean-600 mb-2">Индивидуальный подход</h4>
							<p className="text-sm">Каждый сеанс адаптируется под конкретные потребности клиента</p>
						</div>
					</div>
				</div>
			)
		}
	];

	return (
		<section id="method" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-ocean-50 relative overflow-hidden">
			{/* Декоративные элементы фона */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-10 left-10 w-32 h-32 bg-ocean-200 rounded-full blur-3xl"></div>
				<div className="absolute bottom-20 right-20 w-48 h-48 bg-ocean-100 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-ocean-100 to-transparent rounded-full blur-3xl"></div>
			</div>

			<div className="max-w-5xl mx-auto px-6 relative z-10">
				<div className="text-center mb-12 md:mb-16">
					{/* Бейдж */}
					<div className="inline-flex items-center px-4 py-2 bg-ocean-100 text-ocean-600 rounded-full text-sm font-medium mb-4">
						<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mr-2"></div>
						Инновационная нейротерапия
					</div>

					{/* Главный заголовок */}
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ocean-600 mb-4 leading-tight">
						Метод P-DTR
					</h2>

					{/* Описание */}
					<p className="text-md md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
						Инновационный подход к восстановлению здоровья через работу с нервной системой.
						<span className="text-ocean-600 font-medium"> Быстрые результаты без побочных эффектов.</span>
					</p>

					{/* Декоративная линия */}
					<div className="flex items-center justify-center mt-6 mb-2">
						<div className="h-px bg-gradient-to-r from-transparent via-ocean-500 to-transparent w-32"></div>
						<div className="mx-4 w-1.5 h-1.5 bg-ocean-500 rounded-full"></div>
						<div className="h-px bg-gradient-to-r from-transparent via-ocean-500 to-transparent w-32"></div>
					</div>
				</div>

				<Accordion items={accordionItems} allowMultiple={false} />

				{/* Блок преимуществ P-DTR */}
				<div className="mt-16 md:mt-20">
					<div className="grid gap-6 md:grid-cols-2 lg:gap-8">
						{/* Решение эмоциональных проблем */}
						<div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
							<div className="relative">
								<div className="flex items-start gap-5 mb-6">
									<div className="flex-shrink-0">
										<svg className="w-8 h-8 text-ocean-600 group-hover:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
											Эмоциональные и психосоматические проблемы
										</h4>
										<div className="w-12 h-0.5 bg-gradient-to-r from-ocean-500 to-ocean-300 rounded-full"></div>
									</div>
								</div>
								<div className="text-gray-700 text-sm leading-relaxed space-y-3">
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Интеграция P-DTR с психотерапией для достижения максимальных результатов. Эффективная коррекция острых состояний: утрата, расставание, конфликты.</p>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Работа с хроническими проблемами: фобии, страхи, иррациональное поведение. Восстановление эмоционального баланса и психологического комфорта.</p>
									</div>
								</div>
							</div>
						</div>

						{/* Прокачка функционального состояния */}
						<div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
							<div className="relative">
								<div className="flex items-start gap-5 mb-6">
									<div className="flex-shrink-0">
										<svg className="w-8 h-8 text-emerald-600 group-hover:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
										</svg>
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
											Оптимизация функционального состояния
										</h4>
										<div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"></div>
									</div>
								</div>
								<div className="text-gray-700 text-sm leading-relaxed space-y-3">
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Устранение энергозатратных программ в работе нервной системы для повышения общей функциональности организма.</p>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Улучшение координации, концентрации внимания, качества сна. Оптимизация работы всех систем организма для достижения пикового состояния.</p>
									</div>
								</div>
							</div>
						</div>

						{/* Облегчение боли */}
						<div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
							<div className="relative">
								<div className="flex items-start gap-5 mb-6">
									<div className="flex-shrink-0">
										<svg className="w-8 h-8 text-amber-600 group-hover:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
										</svg>
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
											Эффективное облегчение болевых синдромов
										</h4>
										<div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></div>
									</div>
								</div>
								<div className="text-gray-700 text-sm leading-relaxed space-y-3">
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Комплексный подход к уменьшению хронической и острой боли различной этиологии через работу с нервной системой.</p>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Восстановление правильных двигательных паттернов, снятие мышечных зажимов и напряжений. Долговременный эффект без медикаментов.</p>
									</div>
								</div>
							</div>
						</div>

						{/* Повышение уровня энергии */}
						<div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
							<div className="relative">
								<div className="flex items-start gap-5 mb-6">
									<div className="flex-shrink-0">
										<svg className="w-8 h-8 text-violet-600 group-hover:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
									</div>
									<div className="flex-1">
										<h4 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
											Восстановление энергетических ресурсов
										</h4>
										<div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-violet-300 rounded-full"></div>
									</div>
								</div>
								<div className="text-gray-700 text-sm leading-relaxed space-y-3">
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Борьба с хронической усталостью, апатией и преддепрессивными состояниями через нормализацию работы нервной системы.</p>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-1.5 h-1.5 bg-ocean-500 rounded-full mt-2 flex-shrink-0"></div>
										<p>Активация естественных энергетических резервов организма. Улучшение качества отдыха и восстановления для стабильного уровня энергии.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PDTRMethod;