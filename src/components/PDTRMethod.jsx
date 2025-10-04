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
					<div className="grid gap-4">
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
					<p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
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
			</div>
		</section>
	);
};

export default PDTRMethod;