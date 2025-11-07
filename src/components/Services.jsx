import React, { useEffect, useState } from 'react'
import SectionHeader from './SectionHeader';
import SectionDescription from './SectionDescription';
import BookingWidget from './BookingWidget';
import { getServices } from '../lib/services';

// Вспомогательная функция для форматирования длительности
function formatDuration(from, to, type) {
	if (type === 'none') return ''

	const value = from === to ? `${from}` : `${from} - ${to}`

	switch (type) {
		case 'minutes':
			return `${value} мин`
		case 'hours':
			return `${value} ${from === 1 ? 'час' : from < 6 ? 'часа' : 'часов'}`
		case 'sessions':
			return `${value} ${from === 1 ? 'сеанс' : from < 6 ? 'сеанса' : 'сеансов'}`
		default:
			return ''
	}
}

// Вспомогательная функция для форматирования цены
function formatPrice(price, priceFrom) {
	const formatted = price.toLocaleString('ru-RU')
	return priceFrom ? `от ${formatted} ₽` : `${formatted} ₽`
}

const Services = () => {
	const [services, setServices] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadServices() {
			setLoading(true)
			const { data, error } = await getServices()
			if (!error && data) {
				setServices(data)
			}
			setLoading(false)
		}
		loadServices()
	}, [])

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
					{loading ? (
						<div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 p-8 text-center">
							<div className="inline-block w-8 h-8 border-4 border-ocean-300 border-t-transparent rounded-full animate-spin"></div>
							<p className="text-slate-300 mt-4">Загрузка услуг...</p>
						</div>
					) : services.length === 0 ? (
						<div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 p-8 text-center">
							<p className="text-slate-300">Услуги временно недоступны</p>
						</div>
					) : (
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
												{formatPrice(service.price, service.price_from)}
											</div>
										</div>

										{service.duration_type !== 'none' && (
											<p className="text-sm sm:text-base text-ocean-200">
												{formatDuration(service.duration_from, service.duration_to, service.duration_type)}
											</p>
										)}

										{service.description && (
											<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
												{service.description}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Онлайн запись */}
				<div className="max-w-4xl mx-auto">
					{/* Заголовок раздела */}
					<div id="booking" className="text-center mb-8 sm:mb-12 pt-24">
						<SectionHeader title="Онлайн запись" isDarkMode={true} />
						<SectionDescription text="Выберите удобные дату и время для консультации" isDarkMode={true} />
					</div>

					<div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 p-4 sm:p-6 md:p-8">
						<BookingWidget />
					</div>
				</div>
			</div>
		</section>
	)
}

export default Services
