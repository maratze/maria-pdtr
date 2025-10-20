import React from 'react'
import { HiOutlineGift, HiOutlineCalendar, HiOutlineGlobe, HiOutlineClock, HiSparkles } from 'react-icons/hi'

function GiftCertificate() {
	const benefits = [
		{
			icon: HiOutlineCalendar,
			text: "На 1 и 2 сеанса"
		},
		{
			icon: HiOutlineGlobe,
			text: "В любом городе"
		},
		{
			icon: HiOutlineClock,
			text: "Действует 6 месяцев"
		}
	]

	return (
		<section className="relative py-10 sm:py-12 bg-slate-50">
			{/* Улучшенный фон с паттерном */}
			<div className="absolute inset-0 overflow-hidden">
				{/* Градиентные блики */}
				<div className="absolute top-1/2 left-1/4 w-96 h-96 bg-ocean-100/30 rounded-full blur-3xl transform -translate-y-1/2"></div>
				<div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl transform -translate-y-1/2"></div>

				{/* Тонкая сетка для текстуры */}
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage: `radial-gradient(circle, #1e293b 1px, transparent 1px)`,
						backgroundSize: '24px 24px'
					}}
				></div>
			</div>

			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-5xl mx-auto">
					{/* Премиум карточка */}
					<div className="relative bg-white rounded-2xl shadow-md border-1 border-slate-100 overflow-hidden group hover:shadow-xl hover:border-ocean-200 transition-all duration-500">
						{/* Тонкая градиентная линия сверху */}
						<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ocean-400 via-ocean-500 to-blue-500"></div>

						<div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center p-8 sm:p-10">
							{/* Левая часть - контент */}
							<div className="space-y-6">
								{/* Заголовок с иконкой */}
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ocean-600 flex items-center justify-center shadow-lg transition-transform duration-300">
										<HiOutlineGift className="text-2xl text-white" />
									</div>
									<div>
										<h2 className="text-2xl sm:text-3xl font-light text-slate-900 leading-tight">
											Подарочный сертификат
										</h2>
										<p className="text-md text-ocean-600 font-regular">
											Идеальный подарок для близких
										</p>
									</div>
								</div>

								{/* Преимущества в одну строку */}
								<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
									{benefits.map((benefit, index) => {
										const IconComponent = benefit.icon
										return (
											<div
												key={index}
												className="flex items-center gap-2"
											>
												<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ocean-50 flex items-center justify-center">
													<IconComponent className="text-xl text-ocean-600" />
												</div>
												<span className="text-md text-slate-700 font-normal whitespace-nowrap">{benefit.text}</span>
											</div>
										)
									})}
								</div>
							</div>

							{/* Правая часть - CTA */}
							<div className="flex items-center justify-center lg:justify-end">
								<a
									href="https://t.me/maria_pdtr"
									target="_blank"
									rel="noopener noreferrer"
									className="group/btn relative inline-flex items-center gap-2.5 bg-ocean-600 bg-size-200 hover:bg-ocean-500 bg-pos-0 hover:bg-pos-100 text-white px-8 py-3 rounded-full transform transition-all duration-300 shadow-lg shadow-ocean-500/40 hover:shadow-lg hover:shadow-ocean-500/50 text-base whitespace-nowrap font-light"
									style={{ backgroundSize: '200% auto' }}
								>
									<HiSparkles className="text-xl group-hover/btn:rotate-12 transition-transform duration-300" />
									<span>Оформить</span>
									<svg
										className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform duration-300"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default GiftCertificate
