import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../lib/supabaseClient';
import AdminPreloader from '../components/AdminPreloader';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

interface BookingAttempt {
	id: string;
	ip_address: string;
	client_fingerprint: string | null;
	client_name: string;
	client_phone: string;
	client_email: string;
	attempt_time: string;
	success: boolean;
	blocked: boolean;
}

interface BlockedClient {
	id: string;
	ip_address: string | null;
	client_fingerprint: string | null;
	phone_number: string | null;
	email: string | null;
	reason: string;
	blocked_at: string;
	blocked_until: string | null;
	is_permanent: boolean;
	notes: string | null;
}

const AdminSecurity: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [attempts, setAttempts] = useState<BookingAttempt[]>([]);
	const [blockedClients, setBlockedClients] = useState<BlockedClient[]>([]);
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		variant?: 'warning' | 'danger';
		onConfirm: () => void;
	} | null>(null);

	// Форма для блокировки
	const [showBlockForm, setShowBlockForm] = useState(false);
	const [blockForm, setBlockForm] = useState({
		ip_address: '',
		phone_number: '',
		email: '',
		reason: '',
		is_permanent: true,
		hours: 24,
	});

	// Статистика
	const [stats, setStats] = useState({
		total_attempts_24h: 0,
		successful_attempts_24h: 0,
		failed_attempts_24h: 0,
		blocked_count: 0,
	});

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);
			await Promise.all([loadAttempts(), loadBlockedClients(), loadStats()]);
		} catch (error) {
			console.error('Error loading data:', error);
			setToast({ message: 'Ошибка загрузки данных', type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	// Реактивное обновление без лоадера
	const refreshData = async () => {
		try {
			setRefreshing(true);
			await Promise.all([loadAttempts(), loadBlockedClients(), loadStats()]);
		} catch (error) {
			console.error('Error refreshing data:', error);
			setToast({ message: 'Ошибка обновления данных', type: 'error' });
		} finally {
			setRefreshing(false);
		}
	};

	const loadAttempts = async () => {
		if (!supabaseAdmin) return;

		const { data, error } = await supabaseAdmin
			.from('booking_attempts')
			.select('*')
			.order('attempt_time', { ascending: false })
			.limit(100);

		if (error) {
			console.error('Error loading attempts:', error);
			throw error;
		}

		setAttempts(data || []);
	};

	const loadBlockedClients = async () => {
		if (!supabaseAdmin) return;

		const { data, error } = await supabaseAdmin
			.from('blocked_clients')
			.select('*')
			.order('blocked_at', { ascending: false });

		if (error) {
			console.error('Error loading blocked clients:', error);
			throw error;
		}

		setBlockedClients(data || []);
	};

	const loadStats = async () => {
		if (!supabaseAdmin) return;

		const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

		// Подсчет попыток за последние 24 часа
		const { count: totalAttempts } = await supabaseAdmin
			.from('booking_attempts')
			.select('*', { count: 'exact', head: true })
			.gte('attempt_time', last24Hours);

		// Успешные попытки за последние 24 часа
		const { count: successfulAttempts } = await supabaseAdmin
			.from('booking_attempts')
			.select('*', { count: 'exact', head: true })
			.eq('success', true)
			.gte('attempt_time', last24Hours);

		// Неудачные попытки за последние 24 часа
		const { count: failedAttempts } = await supabaseAdmin
			.from('booking_attempts')
			.select('*', { count: 'exact', head: true })
			.eq('success', false)
			.gte('attempt_time', last24Hours);

		// Заблокировано за последние 24 часа
		const { count: blockedCount } = await supabaseAdmin
			.from('blocked_clients')
			.select('*', { count: 'exact', head: true })
			.gte('blocked_at', last24Hours);

		setStats({
			total_attempts_24h: totalAttempts || 0,
			successful_attempts_24h: successfulAttempts || 0,
			failed_attempts_24h: failedAttempts || 0,
			blocked_count: blockedCount || 0,
		});
	};

	const handleBlockClient = async () => {
		if (!supabaseAdmin) return;

		if (!blockForm.ip_address && !blockForm.phone_number && !blockForm.email) {
			setToast({ message: 'Укажите хотя бы один параметр для блокировки', type: 'error' });
			return;
		}

		try {
			const blockData: any = {
				reason: blockForm.reason || 'Ручная блокировка администратором',
				is_permanent: blockForm.is_permanent,
			};

			if (blockForm.ip_address) blockData.ip_address = blockForm.ip_address;
			if (blockForm.phone_number) blockData.phone_number = blockForm.phone_number;
			if (blockForm.email) blockData.email = blockForm.email;

			if (!blockForm.is_permanent) {
				const blockedUntil = new Date(Date.now() + blockForm.hours * 60 * 60 * 1000);
				blockData.blocked_until = blockedUntil.toISOString();
			}

			// Блокируем клиента
			const { error } = await supabaseAdmin.from('blocked_clients').insert(blockData);

			if (error) throw error;

			// Удаляем все бронирования заблокированного клиента
			let deletedCount = 0;

			// Удаляем по IP адресу
			if (blockForm.ip_address) {
				const { error: deleteError, count } = await supabaseAdmin
					.from('bookings')
					.delete({ count: 'exact' })
					.eq('ip_address', blockForm.ip_address);

				if (!deleteError && count) deletedCount += count;
			}

			// Удаляем по телефону
			if (blockForm.phone_number) {
				const { error: deleteError, count } = await supabaseAdmin
					.from('bookings')
					.delete({ count: 'exact' })
					.eq('client_phone', blockForm.phone_number);

				if (!deleteError && count) deletedCount += count;
			}

			// Удаляем по email
			if (blockForm.email) {
				const { error: deleteError, count } = await supabaseAdmin
					.from('bookings')
					.delete({ count: 'exact' })
					.eq('client_email', blockForm.email);

				if (!deleteError && count) deletedCount += count;
			}

			const message = deletedCount > 0
				? `Клиент заблокирован, удалено бронирований: ${deletedCount}`
				: 'Клиент заблокирован';

			setToast({ message, type: 'success' });
			setShowBlockForm(false);
			setBlockForm({
				ip_address: '',
				phone_number: '',
				email: '',
				reason: '',
				is_permanent: true,
				hours: 24,
			});
			await refreshData();
		} catch (error) {
			console.error('Error blocking client:', error);
			setToast({ message: 'Ошибка блокировки', type: 'error' });
		}
	};

	const handleUnblock = async (id: string) => {
		if (!supabaseAdmin) return;

		try {
			const { error } = await supabaseAdmin.from('blocked_clients').delete().eq('id', id);

			if (error) throw error;

			setToast({ message: 'Блокировка снята', type: 'success' });
			await refreshData();
		} catch (error) {
			console.error('Error unblocking:', error);
			setToast({ message: 'Ошибка снятия блокировки', type: 'error' });
		}
	};

	const handleAutoBlock = async () => {
		if (!supabaseAdmin) return;

		try {
			const { error } = await supabaseAdmin.rpc('auto_block_suspicious_activity');

			if (error) throw error;

			setToast({ message: 'Автоматическая блокировка выполнена', type: 'success' });
			await refreshData();
		} catch (error) {
			console.error('Error auto-blocking:', error);
			setToast({ message: 'Ошибка автоблокировки', type: 'error' });
		}
	};

	const handleQuickBlock = (ip: string, phone: string) => {
		setBlockForm({
			...blockForm,
			ip_address: ip,
			phone_number: phone,
		});
		setShowBlockForm(true);
	};

	const handleDeleteAttempt = async (id: string) => {
		if (!supabaseAdmin) return;

		try {
			const { error } = await supabaseAdmin.from('booking_attempts').delete().eq('id', id);

			if (error) throw error;

			setToast({ message: 'Попытка удалена', type: 'success' });
			await refreshData();
		} catch (error) {
			console.error('Error deleting attempt:', error);
			setToast({ message: 'Ошибка удаления попытки', type: 'error' });
		}
	};

	// Проверка, заблокирован ли клиент
	const isClientBlocked = (ip: string, phone: string, email: string): boolean => {
		return blockedClients.some(
			(blocked) =>
				(blocked.ip_address && blocked.ip_address === ip) ||
				(blocked.phone_number && blocked.phone_number === phone) ||
				(blocked.email && blocked.email === email)
		);
	};

	if (loading) return <AdminPreloader />;

	return (
		<div className="space-y-3">
			{/* Stats Card */}
			<div className="bg-white rounded-xl border border-slate-200 p-4">
				<p className="text-sm text-slate-500 mb-3">Статистика за последние 24 часа</p>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
					<div className="flex flex-col">
						<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Попыток</p>
						<p className="text-xl sm:text-2xl font-regular text-slate-900">{stats.total_attempts_24h}</p>
					</div>
					<div className="flex flex-col">
						<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Успешных</p>
						<p className="text-xl sm:text-2xl font-regular text-emerald-600">{stats.successful_attempts_24h}</p>
					</div>
					<div className="flex flex-col">
						<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Неудачных</p>
						<p className="text-xl sm:text-2xl font-regular text-red-600">{stats.failed_attempts_24h}</p>
					</div>
					<div className="flex flex-col">
						<p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Заблокировано</p>
						<p className="text-xl sm:text-2xl font-regular text-slate-900">{stats.blocked_count}</p>
					</div>
				</div>

				{/* Кнопки действий */}
				<div className="flex flex-wrap gap-2 mt-4">
					<button
						onClick={() => setShowBlockForm(true)}
						className="flex items-center gap-2 px-3 py-2 h-10 rounded-lg bg-ocean-600 text-white text-sm font-normal hover:bg-ocean-700 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Заблокировать клиента
					</button>
					<button
						onClick={handleAutoBlock}
						className="px-3 py-2 h-10 rounded-lg bg-slate-100 text-slate-700 text-sm font-normal hover:bg-slate-200 transition-colors"
					>
						Автоблокировка подозрительных
					</button>
					<button
						onClick={refreshData}
						disabled={refreshing}
						className="flex items-center gap-2 px-3 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-normal hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{refreshing ? (
							<>
								<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Обновление...
							</>
						) : (
							'Обновить'
						)}
					</button>
				</div>
			</div>

			{/* Форма блокировки */}
			{showBlockForm && (
				<div className="fixed inset-0 z-50">
					{/* Затемненный фон */}
					<div
						className="fixed inset-0 bg-black/50"
						onClick={() => setShowBlockForm(false)}
					/>

					{/* Контейнер для центрирования */}
					<div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
						<div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
							<h2 className="text-lg font-normal text-slate-900 mb-4">Заблокировать клиента</h2>

							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										IP адрес
									</label>
									<input
										type="text"
										value={blockForm.ip_address}
										onChange={(e) =>
											setBlockForm({ ...blockForm, ip_address: e.target.value })
										}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										placeholder="192.168.1.1"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Телефон
									</label>
									<input
										type="text"
										value={blockForm.phone_number}
										onChange={(e) =>
											setBlockForm({ ...blockForm, phone_number: e.target.value })
										}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										placeholder="+7 900 123-45-67"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Email
									</label>
									<input
										type="email"
										value={blockForm.email}
										onChange={(e) => setBlockForm({ ...blockForm, email: e.target.value })}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
										placeholder="email@example.com"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Причина
									</label>
									<textarea
										value={blockForm.reason}
										onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
										className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 resize-none"
										rows={3}
										placeholder="Причина блокировки..."
									/>
								</div>

								<label className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
									<input
										type="checkbox"
										id="permanent"
										checked={blockForm.is_permanent}
										onChange={(e) =>
											setBlockForm({ ...blockForm, is_permanent: e.target.checked })
										}
										className="rounded border-slate-300 text-ocean-600 focus:ring-ocean-500"
									/>
									<span className="text-sm text-slate-700">Постоянная блокировка</span>
								</label>

								{!blockForm.is_permanent && (
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Часов блокировки
										</label>
										<input
											type="number"
											value={blockForm.hours}
											onChange={(e) =>
												setBlockForm({ ...blockForm, hours: parseInt(e.target.value) || 24 })
											}
											className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 h-10 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
											min="1"
											max="720"
										/>
									</div>
								)}
							</div>

							<div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-4">
								<button
									onClick={handleBlockClient}
									className="px-4 py-2 h-10 rounded-lg bg-emerald-600 text-white text-sm font-normal hover:bg-emerald-700 transition-colors"
								>
									Заблокировать
								</button>
								<button
									onClick={() => setShowBlockForm(false)}
									className="px-4 py-2 h-10 rounded-lg border border-slate-200 text-slate-600 text-sm font-normal hover:bg-slate-50 transition-colors"
								>
									Отмена
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Заблокированные клиенты */}
			{blockedClients.length > 0 && (
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
					<div className="p-4 border-b border-slate-200">
						<h2 className="text-base font-normal text-slate-900">
							Заблокированные клиенты ({blockedClients.length})
						</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-slate-50 border-b border-slate-200">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										IP адрес
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Телефон
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Email
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Причина
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Тип
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										До
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
										Действия
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{blockedClients.map((client) => (
									<tr key={client.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-3 text-sm font-mono text-slate-900">
											{client.ip_address || '—'}
										</td>
										<td className="px-4 py-3 text-sm text-slate-900">
											{client.phone_number || '—'}
										</td>
										<td className="px-4 py-3 text-sm text-slate-900 max-w-[200px] truncate">
											{client.email || '—'}
										</td>
										<td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
											{client.reason}
										</td>
										<td className="px-4 py-3 text-sm">
											{client.is_permanent ? (
												<span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
													Постоянная
												</span>
											) : (
												<span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
													Временная
												</span>
											)}
										</td>
										<td className="px-4 py-3 text-sm text-slate-600">
											{client.is_permanent
												? '∞'
												: new Date(client.blocked_until!).toLocaleString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
										</td>
										<td className="px-4 py-3 text-sm text-right">
											<button
												onClick={() =>
													setConfirmDialog({
														isOpen: true,
														title: 'Снять блокировку?',
														message: 'Вы уверены, что хотите снять блокировку с этого клиента?',
														confirmText: 'Разблокировать',
														variant: 'warning',
														onConfirm: () => handleUnblock(client.id),
													})
												}
												className="text-[13px] text-ocean-600 hover:text-ocean-700 transition-colors"
											>
												Разблокировать
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Последние попытки */}
			{attempts.length > 0 && (
				<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
					<div className="p-4 border-b border-slate-200">
						<h2 className="text-base font-normal text-slate-900">
							Последние подозрительные попытки бронирования
						</h2>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-slate-50 border-b border-slate-200">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Время
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										IP адрес
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Имя
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Телефон
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Email
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
										Статус
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
										Действия
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{attempts.map((attempt) => (
									<tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
										<td className="px-4 py-3 text-sm text-slate-900">
											{new Date(attempt.attempt_time).toLocaleString('ru-RU', {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</td>
										<td className="px-4 py-3 text-sm text-slate-900 font-mono">
											{attempt.ip_address}
										</td>
										<td className="px-4 py-3 text-sm text-slate-900">
											{attempt.client_name}
										</td>
										<td className="px-4 py-3 text-sm text-slate-900">
											{attempt.client_phone}
										</td>
										<td className="px-4 py-3 text-sm text-slate-900 max-w-[200px] truncate">
											{attempt.client_email}
										</td>
										<td className="px-4 py-3 text-sm">
											{attempt.success ? (
												<span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
													Успешно
												</span>
											) : (
												<span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
													Отклонено
												</span>
											)}
										</td>
										<td className="px-4 py-3 text-sm text-right">
											<div className="flex items-center justify-end gap-3">
												{isClientBlocked(
													attempt.ip_address,
													attempt.client_phone,
													attempt.client_email
												) ? (
													<span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
														Заблокирован
													</span>
												) : (
													<button
														onClick={() =>
															handleQuickBlock(attempt.ip_address, attempt.client_phone)
														}
														className="text-[13px] text-ocean-600 hover:text-ocean-700 transition-colors"
													>
														Заблокировать
													</button>
												)}
												<button
													onClick={() =>
														setConfirmDialog({
															isOpen: true,
															title: 'Удалить попытку?',
															message: 'Вы уверены, что хотите удалить эту попытку бронирования из журнала?',
															confirmText: 'Удалить',
															variant: 'danger',
															onConfirm: () => handleDeleteAttempt(attempt.id),
														})
													}
													className="text-[13px] text-red-600 hover:text-red-700 transition-colors"
												>
													Удалить
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}

			{confirmDialog && (
				<ConfirmDialog
					isOpen={confirmDialog.isOpen}
					title={confirmDialog.title}
					description={confirmDialog.message}
					onConfirm={() => {
						confirmDialog.onConfirm();
						setConfirmDialog(null);
					}}
					onClose={() => setConfirmDialog(null)}
					confirmText={confirmDialog.confirmText || 'Подтвердить'}
					variant={confirmDialog.variant || 'warning'}
				/>
			)}
		</div>
	);
};

export default AdminSecurity;
