import React from 'react'
import './App.css'

function App() {
	return (
		<div className="min-h-screen font-sans text-slate-800">
			{/* Hero Section */}
			<section className="min-h-screen flex items-center bg-gradient-to-br from-ocean-50 to-white py-20 lg:py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
						<div className="order-2 lg:order-1">
							<div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-3xl flex items-center justify-center shadow-2xl animate-fade-in">
								<span className="text-ocean-600 text-xl font-medium">Премиальная фотография</span>
							</div>
						</div>
						<div className="order-1 lg:order-2 animate-slide-up">
							<h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-ocean-600 to-ocean-800 bg-clip-text text-transparent mb-4">
								Мария Соломкина
							</h1>
							<p className="text-xl lg:text-2xl text-ocean-600 font-medium mb-6">
								Специалист по методу P-DTR, неврология
							</p>
							<p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-lg">
								Помощь при хронической боли, стрессах и неврологических нарушениях.
								Комплексный подход к восстановлению здоровья через работу с нервной системой.
							</p>
							<a
								href="https://t.me/maria_pdtr"
								className="inline-block bg-gradient-to-r from-ocean-600 to-ocean-400 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:from-ocean-700 hover:to-ocean-500"
								target="_blank"
								rel="noopener noreferrer"
							>
								Записаться на приём
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* About Me Section */}
			<section className="py-20 lg:py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-5 gap-16 items-center">
						<div className="lg:col-span-2">
							<div className="w-full h-96 bg-gradient-to-br from-ocean-200 to-ocean-300 rounded-3xl flex items-center justify-center shadow-xl">
								<span className="text-ocean-700 text-xl font-medium">Фото Марии</span>
							</div>
						</div>
						<div className="lg:col-span-3">
							<h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-8">Обо мне</h2>
							<div className="space-y-6 text-lg text-slate-600 leading-relaxed">
								<p>
									Я — Мария Соломкина, специалист с многолетним опытом в области неврологии
									и реабилитации. Владею уникальным методом P-DTR (Proprioceptive Deep Tendon Reflex),
									который позволяет эффективно работать с болевыми синдромами и функциональными нарушениями.
								</p>
								<p>
									Организую семинары и привожу автора метода P-DTR в Россию, активно участвую
									в научной работе и развитии метода. Мой подход сочетает глубокую экспертность
									с индивидуальным вниманием к каждому пациенту.
								</p>
							</div>
							<div className="mt-8 space-y-4">
								<div className="flex items-center space-x-4 p-4 border-l-4 border-ocean-300 bg-ocean-50 rounded-r-xl">
									<span className="text-2xl">📚</span>
									<span className="font-medium text-slate-700">Сертифицированный специалист P-DTR</span>
								</div>
								<div className="flex items-center space-x-4 p-4 border-l-4 border-ocean-300 bg-ocean-50 rounded-r-xl">
									<span className="text-2xl">🧠</span>
									<span className="font-medium text-slate-700">Специалист по психоэмоциональной коррекции</span>
								</div>
								<div className="flex items-center space-x-4 p-4 border-l-4 border-ocean-300 bg-ocean-50 rounded-r-xl">
									<span className="text-2xl">💙</span>
									<span className="font-medium text-slate-700">Метод "Понимающая психотерапия"</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Method Section */}
			<section className="py-20 lg:py-24 bg-slate-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl lg:text-5xl font-bold text-center text-slate-800 mb-16">О методе P-DTR</h2>
					<div className="space-y-16">
						<div className="text-center max-w-4xl mx-auto">
							<h3 className="text-2xl lg:text-3xl font-semibold text-ocean-600 mb-6">Что такое P-DTR?</h3>
							<p className="text-lg lg:text-xl text-slate-600 leading-relaxed">
								P-DTR (Proprioceptive Deep Tendon Reflex) — это инновационный метод диагностики
								и коррекции функциональных нарушений нервной системы. Простыми словами, это способ
								"перезагрузить" нервную систему, убрав ненужные блоки и восстановив естественную работу организма.
							</p>
						</div>

						<div>
							<h3 className="text-2xl lg:text-3xl font-semibold text-center text-ocean-600 mb-12">Почему это работает:</h3>
							<div className="grid md:grid-cols-3 gap-8">
								<div className="bg-white p-8 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center border border-ocean-100">
									<div className="text-6xl mb-6">🎯</div>
									<h4 className="text-xl font-semibold text-ocean-600 mb-4">Точная диагностика</h4>
									<p className="text-slate-600">Мануально-мышечное тестирование позволяет точно определить источник проблемы</p>
								</div>
								<div className="bg-white p-8 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center border border-ocean-100">
									<div className="text-6xl mb-6">🔄</div>
									<h4 className="text-xl font-semibold text-ocean-600 mb-4">Системный подход</h4>
									<p className="text-slate-600">Работаем с первопричинами, а не только с симптомами</p>
								</div>
								<div className="bg-white p-8 rounded-3xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl text-center border border-ocean-100">
									<div className="text-6xl mb-6">⚡</div>
									<h4 className="text-xl font-semibold text-ocean-600 mb-4">Быстрый результат</h4>
									<p className="text-slate-600">Изменения часто заметны уже после первого сеанса</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Services Section */}
			<section className="py-20 lg:py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl lg:text-5xl font-bold text-center text-slate-800 mb-16">С какими запросами я работаю</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="bg-slate-50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-5xl mb-6">💔</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Хроническая боль</h3>
							<p className="text-slate-600">Головные боли, боли в спине, суставах, мышечные напряжения</p>
						</div>
						<div className="bg-slate-50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-5xl mb-6">😰</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Эмоциональные блоки</h3>
							<p className="text-slate-600">Тревожность, фобии, страхи, депрессивные состояния</p>
						</div>
						<div className="bg-slate-50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-5xl mb-6">🔋</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Низкая энергия</h3>
							<p className="text-slate-600">Хроническая усталость, апатия, снижение жизненного тонуса</p>
						</div>
						<div className="bg-slate-50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-5xl mb-6">🧘</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Посттравматические состояния</h3>
							<p className="text-slate-600">Последствия травм, операций, стрессовых ситуаций</p>
						</div>
						<div className="bg-slate-50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-5xl mb-6">💰</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Денежные блоки</h3>
							<p className="text-slate-600">Проблемы с проявленностью, самооценкой, финансовыми установками</p>
						</div>
						<div className="bg-slate-50 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-5xl mb-6">🏃</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Восстановление после травм</h3>
							<p className="text-slate-600">Реабилитация, восстановление функций, улучшение координации</p>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 lg:py-24 bg-ocean-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl lg:text-5xl font-bold text-center text-slate-800 mb-16">Отзывы и истории клиентов</h2>
					<div className="grid lg:grid-cols-3 gap-8">
						<div className="bg-white p-8 rounded-3xl shadow-lg relative">
							<div className="absolute -top-4 left-8 text-6xl text-ocean-300 font-serif">"</div>
							<div className="pt-8">
								<h4 className="text-xl font-semibold text-ocean-600 mb-4">Избавление от мигрени</h4>
								<p className="text-slate-600 italic leading-relaxed mb-6">
									"Мигрень мучила меня с 6 лет. После работы с Марией через метод P-DTR
									мы обнаружили эмоциональный блок, связанный с детской травмой.
									Спустя неделю после сеанса мигрени исчезли полностью."
								</p>
								<div className="text-right text-ocean-600 font-semibold">— Анна, 30 лет</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-3xl shadow-lg relative">
							<div className="absolute -top-4 left-8 text-6xl text-ocean-300 font-serif">"</div>
							<div className="pt-8">
								<h4 className="text-xl font-semibold text-ocean-600 mb-4">Преодоление страха одиночества</h4>
								<p className="text-slate-600 italic leading-relaxed mb-6">
									"Постоянный страх одиночества мешал строить отношения. Мария помогла
									найти и проработать эмоциональные блоки в теле. Сейчас я чувствую
									лёгкость и встретила прекрасного человека."
								</p>
								<div className="text-right text-ocean-600 font-semibold">— Алена</div>
							</div>
						</div>

						<div className="bg-white p-8 rounded-3xl shadow-lg relative">
							<div className="absolute -top-4 left-8 text-6xl text-ocean-300 font-serif">"</div>
							<div className="pt-8">
								<h4 className="text-xl font-semibold text-ocean-600 mb-4">Решение проблем с светочувствительностью</h4>
								<p className="text-slate-600 italic leading-relaxed mb-6">
									"Повышенная чувствительность к свету мешала нормально жить.
									Через P-DTR выяснилось, что причина в старой травме носа.
									После коррекции дискомфорт полностью ушёл."
								</p>
								<div className="text-right text-ocean-600 font-semibold">— Михаил</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Formats Section */}
			<section className="py-20 lg:py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl lg:text-5xl font-bold text-center text-slate-800 mb-16">Форматы работы</h2>
					<div className="grid md:grid-cols-3 gap-8 mb-16">
						<div className="bg-slate-50 p-8 rounded-3xl text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-6xl mb-6">🏢</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Офлайн в Москве</h3>
							<p className="text-slate-600 mb-6">Индивидуальные сеансы в комфортном кабинете</p>
							<div className="text-xl font-bold text-ocean-800">от 10 000 ₽</div>
						</div>

						<div className="bg-slate-50 p-8 rounded-3xl text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-6xl mb-6">✈️</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Выездные приёмы</h3>
							<p className="text-slate-600 mb-6">Казань, СПб, Ростов, Новосибирск и другие города</p>
							<div className="text-xl font-bold text-ocean-800">по запросу</div>
						</div>

						<div className="bg-slate-50 p-8 rounded-3xl text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-ocean-200 hover:bg-white">
							<div className="text-6xl mb-6">💻</div>
							<h3 className="text-xl font-semibold text-ocean-600 mb-4">Онлайн-консультации</h3>
							<p className="text-slate-600 mb-6">Удобный формат для психоэмоциональной работы</p>
							<div className="text-xl font-bold text-ocean-800">от 15 000 ₽</div>
						</div>
					</div>

					<div className="max-w-4xl mx-auto">
						<h3 className="text-2xl lg:text-3xl font-semibold text-center text-ocean-600 mb-12">Дополнительные услуги</h3>
						<div className="space-y-6">
							<div className="flex items-start space-x-6 p-6 bg-ocean-50 rounded-2xl">
								<span className="text-3xl flex-shrink-0">🎁</span>
								<div>
									<h4 className="text-xl font-semibold text-slate-800 mb-2">Подарочные сертификаты</h4>
									<p className="text-slate-600">На 1 или 2 сеанса, действуют 6 месяцев</p>
								</div>
							</div>
							<div className="flex items-start space-x-6 p-6 bg-ocean-50 rounded-2xl">
								<span className="text-3xl flex-shrink-0">👥</span>
								<div>
									<h4 className="text-xl font-semibold text-slate-800 mb-2">Групповое обучение методу</h4>
									<p className="text-slate-600">16 часов практики и теории (до 4 человек)</p>
								</div>
							</div>
							<div className="flex items-start space-x-6 p-6 bg-ocean-50 rounded-2xl">
								<span className="text-3xl flex-shrink-0">🤝</span>
								<div>
									<h4 className="text-xl font-semibold text-slate-800 mb-2">Индивидуальное сопровождение</h4>
									<p className="text-slate-600">Персональное ведение до достижения цели</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section className="py-20 lg:py-24 bg-slate-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl lg:text-5xl font-bold text-center text-slate-800 mb-16">Контакты</h2>
					<div className="grid lg:grid-cols-2 gap-16">
						<div className="space-y-8">
							<div className="flex items-start space-x-6">
								<div className="bg-ocean-100 p-4 rounded-2xl flex-shrink-0">
									<span className="text-2xl">📞</span>
								</div>
								<div>
									<h4 className="text-xl font-semibold text-ocean-600 mb-2">Телефон</h4>
									<a href="tel:+79660962626" className="text-lg text-slate-600 hover:text-ocean-600 transition-colors">
										+7 (966) 096 26 26
									</a>
								</div>
							</div>

							<div className="flex items-start space-x-6">
								<div className="bg-ocean-100 p-4 rounded-2xl flex-shrink-0">
									<span className="text-2xl">✉️</span>
								</div>
								<div>
									<h4 className="text-xl font-semibold text-ocean-600 mb-2">Email</h4>
									<a href="mailto:solomkina.pdtr@yandex.ru" className="text-lg text-slate-600 hover:text-ocean-600 transition-colors">
										solomkina.pdtr@yandex.ru
									</a>
								</div>
							</div>

							<div className="flex items-start space-x-6">
								<div className="bg-ocean-100 p-4 rounded-2xl flex-shrink-0">
									<span className="text-2xl">📍</span>
								</div>
								<div>
									<h4 className="text-xl font-semibold text-ocean-600 mb-2">Адрес</h4>
									<p className="text-lg text-slate-600">Москва, по предварительной записи</p>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-2xl font-semibold text-ocean-600 mb-8">Мессенджеры и соцсети</h4>
							<div className="space-y-4 max-w-sm">
								<a
									href="https://t.me/maria_pdtr"
									className="flex items-center space-x-4 p-4 bg-white border-2 border-ocean-200 rounded-2xl hover:bg-ocean-600 hover:text-white transition-all duration-300 group"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="text-2xl">📱</span>
									<span className="font-medium">Telegram</span>
								</a>
								<a
									href="https://wa.me/79660962626"
									className="flex items-center space-x-4 p-4 bg-white border-2 border-ocean-200 rounded-2xl hover:bg-ocean-600 hover:text-white transition-all duration-300 group"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="text-2xl">💬</span>
									<span className="font-medium">WhatsApp</span>
								</a>
								<a
									href="https://t.me/moscow_pdtr"
									className="flex items-center space-x-4 p-4 bg-white border-2 border-ocean-200 rounded-2xl hover:bg-ocean-600 hover:text-white transition-all duration-300 group"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span className="text-2xl">📢</span>
									<span className="font-medium">Telegram-канал</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-ocean-800 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="grid lg:grid-cols-3 gap-12 mb-12">
						<div className="lg:col-span-2">
							<h3 className="text-2xl font-bold text-ocean-200 mb-4">Мария Соломкина</h3>
							<p className="text-lg text-ocean-100 mb-2">Специалист метода P-DTR, неврология</p>
							<p className="text-ocean-300">Индивидуальный предприниматель</p>
						</div>

						<div className="space-y-4">
							<a href="#privacy" className="block text-ocean-200 hover:text-white transition-colors">
								Политика конфиденциальности
							</a>
							<a href="#terms" className="block text-ocean-200 hover:text-white transition-colors">
								Согласие на обработку данных
							</a>
						</div>
					</div>

					<div className="border-t border-ocean-600 pt-8 text-center">
						<p className="text-ocean-300">&copy; 2024 Мария Соломкина. Все права защищены.</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

export default App
