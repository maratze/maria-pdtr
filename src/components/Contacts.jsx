import React from 'react';
import { FaInstagram, FaTelegram, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';
import SectionHeader from './SectionHeader';

const Contacts = () => {
	return (
		<section id="contacts" className="py-20 bg-white">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<SectionHeader title="Контакты" />

				{/* Основная контактная информация */}
				<div className="text-center mb-12 mt-12">
					<div className="space-y-6">
						<div className="group">
							<div className="inline-flex items-center gap-3 text-slate-700 hover:text-ocean-500 transition-colors">
								<FaPhone className="text-xl" />
								<a href="tel:+79660962626" className="text-2xl font-light tracking-wide">
									+7 (966) 096 26 26
								</a>
							</div>
						</div>

						<div className="group">
							<div className="inline-flex items-center gap-3 text-slate-700 hover:text-ocean-500 transition-colors">
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

				<div className="flex justify-center gap-6 mb-16">
					<a
						href="https://www.instagram.com/pdtr.moscow?igsh=MXM4cmFvZ3JjNHZvOQ%3D%3D&utm_source=qr"
						target="_blank"
						rel="noopener noreferrer"
						className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 hover:border-pink-500 hover:text-pink-500 hover:shadow-lg transition-all duration-300"
						aria-label="Instagram"
					>
						<FaInstagram className="text-2xl" />
					</a>
					<a
						href="https://t.me/maria_pdtr?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%2C%20%D1%85%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B0%D1%82%D1%8C%D1%81%D1%8F%20%D0%BD%D0%B0%20%D0%BF%D1%80%D0%B8%D0%B5%D0%BC"
						target="_blank"
						rel="noopener noreferrer"
						className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-slate-300 text-slate-600 hover:border-ocean-500 hover:text-ocean-500 hover:shadow-lg transition-all duration-300"
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

				{/* Способы оплаты */}
				<div className="text-center pb-10 border-t border-slate-200 pt-10">
					<p className="text-sm text-slate-500 mb-4">Принимаем к оплате</p>
					<img
						src="/payment-logos.png"
						alt="МИР, СБП, Visa, Mastercard, PayKeeper"
						className="mx-auto h-8 object-contain"
					/>
				</div>

				{/* Футер с копирайтом и юридической информацией */}
				<div className="text-center pt-6 border-t border-slate-200">
					<p className="text-slate-600 mb-3">
						© pdtr.moscow 2025. Все права защищены
					</p>
					<p className="text-xs text-slate-400 font-light">
						ИП Соломкина Мария • Москва • ОГРНИП: 325774600515650 • ИНН: 540301416259
					</p>
				</div>
			</div>
		</section>
	);
}; export default Contacts;
