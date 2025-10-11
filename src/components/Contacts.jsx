import React from 'react';
import { FaInstagram, FaTelegram, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

const Contacts = () => {
	return (
		<section id="contacts" className="py-20 bg-white">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Заголовок */}
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-slate-800 mb-4">
						Контакты
					</h2>
					<div className="w-20 h-1 bg-emerald-500 mx-auto"></div>
				</div>

				{/* Основная контактная информация */}
				<div className="text-center mb-12">
					<div className="space-y-6">
						<div className="group">
							<div className="inline-flex items-center gap-3 text-slate-700 hover:text-emerald-600 transition-colors">
								<FaPhone className="text-xl" />
								<a href="tel:+79660962626" className="text-2xl font-light tracking-wide">
									+7 (966) 096 26 26
								</a>
							</div>
						</div>

						<div className="group">
							<div className="inline-flex items-center gap-3 text-slate-700 hover:text-emerald-600 transition-colors">
								<FaEnvelope className="text-xl" />
								<a href="mailto:solomkina.pdtr@yandex.ru" className="text-xl font-light">
									solomkina.pdtr@yandex.ru
								</a>
							</div>
						</div>
					</div>

					<p className="mt-8 text-slate-500 italic font-light">
						Сеанс P-DTR по предварительной записи
					</p>
				</div>

				{/* Социальные сети */}
				<div className="flex justify-center gap-6 mb-16">
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
						className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 hover:border-pink-500 hover:text-pink-500 hover:shadow-lg transition-all duration-300"
						aria-label="Instagram"
					>
						<FaInstagram className="text-2xl" />
					</a>
					<a
						href="https://t.me"
						target="_blank"
						rel="noopener noreferrer"
						className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-500 hover:shadow-lg transition-all duration-300"
						aria-label="Telegram"
					>
						<FaTelegram className="text-2xl" />
					</a>
					<a
						href="https://wa.me/79660962626"
						target="_blank"
						rel="noopener noreferrer"
						className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 hover:border-green-500 hover:text-green-500 hover:shadow-lg transition-all duration-300"
						aria-label="WhatsApp"
					>
						<FaWhatsapp className="text-2xl" />
					</a>
				</div>

				{/* Футер с копирайтом и юридической информацией */}
				<div className="text-center pt-12 border-t border-slate-200">
					<p className="text-slate-600 mb-3">
						© sitename.ru 2025. Все права защищены
					</p>
					<p className="text-xs text-slate-400 font-light">
						ИП Соломкина Мария • ОГРНИП: 123456789123456 • ИНН: 123456789123
					</p>
				</div>
			</div>
		</section>
	);
}; export default Contacts;
