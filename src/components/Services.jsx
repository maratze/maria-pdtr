import React from 'react'
import SectionHeader from './SectionHeader';
import SectionDescription from './SectionDescription';

const Services = () => {
	const services = [
		{
			id: 1,
			title: "Базовый",
			price: "10 000 ₽",
			duration: "45 - 60 мин",
			description: "Индивидуальный сеанс"
		},
		{
			id: 2,
			title: "Денежные вопросы, проявленность",
			price: "15 000 ₽",
			duration: "60 - 90 мин",
			description: "Индивидуальный сеанс"
		},
		{
			id: 3,
			title: "Работа с установками и убеждениями",
			price: "15 000 ₽",
			duration: "60 - 90 мин",
			description: "Индивидуальный сеанс"
		},
		{
			id: 4,
			title: "Комплекс",
			price: "25 000 ₽",
			duration: "3 сеанса",
			description: "Более глубокое погружение в метод P-DTR. Включает 3 сеанса."
		},
		{
			id: 5,
			title: "Индивидуальное сопровождение",
			price: "от 30 000 ₽",
			duration: "",
			description: "Мое персональное сопровождение Вас до достижения желаемой цели/состояния, консультирование и коррекция. Входит 1-2 сеанса офлайн и безлимитные консультации онлайн."
		},
		{
			id: 6,
			title: "Обучение методу психоэмоциональной коррекции",
			price: "40 000 ₽",
			duration: "16 часов",
			description: "Групповое обучение до 4х человек. Длительность 16 часов (4ч. теория, 10ч. практика)"
		}
	]

	return (
		<section id="services" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-ocean-900 py-12 sm:py-16 lg:py-24 overflow-hidden">
			{/* Декоративные элементы фона */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-ocean-600/20 via-transparent to-slate-800/30"></div>
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ocean-400/10 rounded-full blur-3xl"></div>
				<div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>

				{/* Сетка точек */}
				<div className="absolute inset-0 opacity-20">
					<div
						className="w-full h-full"
						style={{
							backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
							backgroundSize: '50px 50px'
						}}
					></div>
				</div>
			</div>

			<div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Заголовок секции */}
				<div className="text-center mb-8 sm:mb-12">
					<SectionHeader title="Услуги" isDarkMode={true} />
					<SectionDescription text="Индивидуальный подход к каждому клиенту. Выберите формат работы, который подходит именно вам." isDarkMode={true} />
				</div>

				{/* Компактный список услуг */}
				<div className="max-w-4xl mx-auto mb-8 sm:mb-12">
					<div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/10">
						{services.map((service, index) => (
							<div
								key={service.id}
								className={`
									p-4 sm:p-6 transition-all duration-300 hover:bg-white/10
									${index !== services.length - 1 ? 'border-b border-white/10' : ''}
								`}
							>
								<div className="flex flex-col gap-2">
									<div className="flex items-start justify-between gap-3">
										<h3 className="text-base sm:text-lg md:text-xl font-light text-white leading-tight flex-1">
											{service.title}
										</h3>
										<div className="text-lg sm:text-xl md:text-2xl font-light text-ocean-300 whitespace-nowrap">
											{service.price}
										</div>
									</div>

									{service.duration && (
										<p className="text-sm sm:text-base text-ocean-200">
											{service.duration}
										</p>
									)}

									<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
										{service.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Онлайн запись */}
				<div id="booking" className="max-w-3xl mx-auto">
					<div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 p-4 sm:p-6 md:p-8">
						<div className="text-center mb-6 sm:mb-8">
							<div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-ocean-600 to-ocean-600/20 rounded-full mb-3 sm:mb-4">
								<svg className="w-6 h-6 sm:w-8 sm:h-8 text-ocean-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-xl sm:text-2xl font-light text-white mb-2 sm:mb-3 px-2">
								Онлайн-запись
							</h3>
							<p className="text-sm sm:text-base text-slate-300 mb-4 sm:mb-6 px-2">
								Скоро здесь появится календарь онлайн-записи. А пока можете записаться удобным способом:
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
							{/* Телефон */}
							<a
								href="tel:+79660962626"
								className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group border border-white/5"
							>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-ocean-600 to-ocean-600/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-gradient-to-r from-ocean-600 to-ocean-600/30 transition-colors">
									<svg className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
									</svg>
								</div>
								<div className="text-sm text-slate-400 mb-1">Позвонить</div>
								<div className="text-sm font-light text-white text-center">+7 (966) 096-26-26</div>
							</a>

							{/* WhatsApp */}
							<a
								href="https://wa.me/79660962626"
								target="_blank"
								rel="noopener noreferrer"
								className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group border border-white/5"
							>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-green-600/30 transition-colors">
									<svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" fill="currentColor" viewBox="0 0 24 24">
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
									</svg>
								</div>
								<div className="text-sm text-slate-400 mb-1">WhatsApp</div>
								<div className="text-sm font-light text-white">Написать</div>
							</a>

							{/* Telegram */}
							<a
								href="https://t.me/maria_pdtr"
								target="_blank"
								rel="noopener noreferrer"
								className="flex flex-col items-center p-3 sm:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group border border-white/5"
							>
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-600/30 transition-colors">
									<svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
										<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
									</svg>
								</div>
								<div className="text-sm text-slate-400 mb-1">Telegram</div>
								<div className="text-sm font-light text-white">Написать</div>
							</a>
						</div>

						<div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-ocean-600 to-ocean-600/10 rounded-xl border border-ocean-500/20">
							<p className="text-md text-slate-300 text-center leading-relaxed">
								💡 Онлайн-календарь появится совсем скоро. Обычно отвечаю в течение часа.
							</p>
						</div>
					</div>
				</div>

				{/* Дополнительная информация */}
				<div className="mt-8 sm:mt-12 text-center px-2">
					<div className="inline-block bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 max-w-2xl border border-white/10">
						<div className="flex items-start gap-3 sm:gap-4">
							<div className="flex-shrink-0">
								<svg className="w-5 h-5 sm:w-6 sm:h-6 text-ocean-300 mt-0.5 sm:mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="text-left">
								<h4 className="font-light text-white mb-1 sm:mb-2 text-lg">Не знаете, что выбрать?</h4>
								<p className="text-slate-300 text-md leading-relaxed">
									Я помогу определиться с форматом работы на бесплатной консультации.
									Свяжитесь со мной удобным способом, и мы обсудим вашу ситуацию.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Services
