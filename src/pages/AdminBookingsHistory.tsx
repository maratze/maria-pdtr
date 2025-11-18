import { useState, useEffect } from 'react'
import { getAllBookings, deleteAllBookings } from '../lib/bookings'
import type { BookingFull } from '../types/booking'
import { getBlockedPhones, blockPhone, unblockPhone } from '../lib/blockedPhones'
import type { BlockedPhone } from '../lib/blockedPhones'
import Toast from '../components/Toast'

export default function AdminBookingsHistory() {
	const [bookings, setBookings] = useState<BookingFull[]>([])
	const [blockedPhones, setBlockedPhones] = useState<BlockedPhone[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedTab, setSelectedTab] = useState<'bookings' | 'blocked'>('bookings')

	// Block phone modal
	const [showBlockModal, setShowBlockModal] = useState(false)
	const [phoneToBlock, setPhoneToBlock] = useState('')
	const [blockReason, setBlockReason] = useState('')
	const [processing, setProcessing] = useState(false)

	// Clear history confirmation
	const [clearingHistory, setClearingHistory] = useState(false)
	const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false)

	// Unblock confirmation
	const [showUnblockConfirm, setShowUnblockConfirm] = useState(false)
	const [phoneToUnblock, setPhoneToUnblock] = useState<string | null>(null)

	// Expandable groups
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

	// Toast notifications
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

	// Helper function to normalize phone numbers for comparison
	const normalizePhone = (phone: string) => phone.replace(/\s/g, '')

	// Helper function to format phone number with spaces
	const formatPhone = (phone: string) => {
		const cleaned = phone.replace(/\s/g, '')
		// Format: +7 XXX XXX XX XX
		if (cleaned.startsWith('+7') && cleaned.length === 12) {
			return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`
		}
		return phone
	}

	useEffect(() => {
		loadData()
	}, [])

	async function loadData() {
		setLoading(true)
		try {
			const [bookingsData, blockedData] = await Promise.all([
				getAllBookings(),
				getBlockedPhones()
			])
			setBookings(bookingsData)
			setBlockedPhones(blockedData)
		} catch (error) {
			console.error('Error loading data:', error)
		} finally {
			setLoading(false)
		}
	}

	async function handleBlockPhone() {
		if (!phoneToBlock) return

		setProcessing(true)
		const result = await blockPhone(phoneToBlock, blockReason, 'admin')

		if (result.success) {
			await loadData()
			setShowBlockModal(false)
			setPhoneToBlock('')
			setBlockReason('')
			setToast({ message: 'Номер успешно заблокирован', type: 'success' })
		} else {
			setToast({ message: result.error || 'Ошибка блокировки', type: 'error' })
		}
		setProcessing(false)
	}

	async function handleUnblockPhone(phoneId: string) {
		setPhoneToUnblock(phoneId)
		setShowUnblockConfirm(true)
	}

	async function confirmUnblock() {
		if (!phoneToUnblock) return

		setProcessing(true)
		const result = await unblockPhone(phoneToUnblock)

		if (result.success) {
			await loadData()
			setShowUnblockConfirm(false)
			setPhoneToUnblock(null)
			setToast({ message: 'Номер успешно разблокирован', type: 'success' })
		} else {
			setToast({ message: result.error || 'Ошибка разблокировки', type: 'error' })
		}
		setProcessing(false)
	}

	function toggleGroup(phone: string) {
		setExpandedGroups(prev => {
			const newSet = new Set(prev)
			if (newSet.has(phone)) {
				newSet.delete(phone)
			} else {
				newSet.add(phone)
			}
			return newSet
		})
	}

	function openBlockModal(phone: string) {
		setPhoneToBlock(phone)
		setShowBlockModal(true)
	}

	async function handleClearHistory() {
		setShowClearHistoryConfirm(true)
	}

	async function confirmClearHistory() {
		setClearingHistory(true)
		try {
			await deleteAllBookings()
			await loadData()
			setShowClearHistoryConfirm(false)
			setToast({ message: 'История успешно очищена', type: 'success' })
		} catch (error) {
			console.error('Error clearing history:', error)
			setToast({ message: 'Ошибка при очистке истории', type: 'error' })
		} finally {
			setClearingHistory(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-slate-400">Загрузка...</div>
			</div>
		)
	}

	// Group bookings by phone number
	const groupedBookings = bookings.reduce((acc, booking) => {
		const phone = booking.client_phone
		if (!acc[phone]) {
			acc[phone] = []
		}
		acc[phone].push(booking)
		return acc
	}, {} as Record<string, BookingFull[]>)

	// Sort groups by total bookings count (descending) and earliest booking date
	const sortedPhoneGroups = Object.entries(groupedBookings).sort((a, b) => {
		// First sort by count (more bookings first)
		if (b[1].length !== a[1].length) {
			return b[1].length - a[1].length
		}
		// Then by earliest booking date (oldest first)
		const earliestA = Math.min(...a[1].map(b => new Date(b.created_at || 0).getTime()))
		const earliestB = Math.min(...b[1].map(b => new Date(b.created_at || 0).getTime()))
		return earliestA - earliestB
	})

	return (
		<div className="space-y-3">
			{/* Tabs and Block Button */}
			<div className="flex items-center justify-between gap-4">
				<div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex gap-1">
					<button
						onClick={() => setSelectedTab('bookings')}
						className={`px-4 h-10 text-sm font-medium rounded-lg transition-colors ${selectedTab === 'bookings'
							? 'bg-ocean-600 text-white shadow-sm'
							: 'text-slate-600 hover:bg-slate-50'
							}`}
					>
						Все записи ({bookings.length})
					</button>
					<button
						onClick={() => setSelectedTab('blocked')}
						className={`px-4 h-10 text-sm font-medium rounded-lg transition-colors ${selectedTab === 'blocked'
							? 'bg-ocean-600 text-white shadow-sm'
							: 'text-slate-600 hover:bg-slate-50'
							}`}
					>
						Заблокированные ({blockedPhones.length})
					</button>
				</div>

				<div className="flex items-center gap-2">
					{selectedTab === 'bookings' && bookings.length > 0 && (
						<button
							onClick={handleClearHistory}
							disabled={clearingHistory}
							className="px-4 h-10 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							{clearingHistory ? 'Очистка...' : 'Очистить историю'}
						</button>
					)}

					<button
						onClick={() => {
							setPhoneToBlock('')
							setBlockReason('')
							setShowBlockModal(true)
						}}
						className="px-4 h-10 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium flex items-center gap-2"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						Заблокировать номер
					</button>
				</div>
			</div>

			{/* Bookings Tab */}
			{selectedTab === 'bookings' && (
				<div className="space-y-2">
					{sortedPhoneGroups.map(([phone, phoneBookings]) => {
						const earliestBooking = phoneBookings.reduce((earliest, current) => {
							return new Date(current.created_at || 0) < new Date(earliest.created_at || 0) ? current : earliest
						})
						const isExpanded = expandedGroups.has(phone)
						const isBlocked = blockedPhones.some(blocked => normalizePhone(blocked.phone) === normalizePhone(phone))

						return (
							<div key={phone} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
								{/* Group Header - Clickable */}
								<div
									className="w-full bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
								>
									<div
										onClick={() => toggleGroup(phone)}
										className="flex items-center gap-4 flex-1"
									>
										{/* Expand/Collapse Icon */}
										<svg
											className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>

										<div className="text-left">
											<div className="flex items-center gap-2">
												<span className="text-md font-medium text-slate-900">{phone}</span>
												<span className="px-3 py-0.5 rounded-full text-sm font-medium bg-ocean-100 text-ocean-700">
													{phoneBookings.length} {phoneBookings.length === 1 ? 'запись' : phoneBookings.length < 5 ? 'записи' : 'записей'}
												</span>
											</div>
											<div className="text-sm text-slate-500 mt-1">
												Первая запись: {new Date(earliestBooking.created_at || 0).toLocaleDateString('ru-RU', {
													day: 'numeric',
													month: 'short',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</div>
										</div>
									</div>
									{isBlocked ? (
										<div className="px-3 h-8 text-sm text-slate-400 bg-slate-100 rounded-lg flex items-center gap-1.5 cursor-not-allowed">
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											Заблокирован
										</div>
									) : (
										<button
											onClick={() => openBlockModal(phone)}
											className="px-3 h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
										>
											<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
											</svg>
											Заблокировать
										</button>
									)}
								</div>

								{/* Bookings Table - Collapsible */}
								{isExpanded && (
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead className="bg-slate-50/50 border-b border-slate-200">
												<tr>
													<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Дата записи</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Время</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Имя</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
													<th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Создано</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-200">
												{phoneBookings
													.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
													.map((booking) => (
														<tr key={booking.id} className="hover:bg-slate-50">
															<td className="px-4 py-3 text-sm text-slate-900">
																{booking.time_slot?.slot_date && new Date(booking.time_slot.slot_date + 'T00:00:00').toLocaleDateString('ru-RU')}
															</td>
															<td className="px-4 py-3 text-sm text-slate-700">
																{booking.time_slot?.start_time || ''} - {booking.time_slot?.end_time || ''}
															</td>
															<td className="px-4 py-3 text-sm font-medium text-slate-900">{booking.client_name}</td>
															<td className="px-4 py-3 text-sm text-slate-500">{booking.client_email || '-'}</td>
															<td className="px-4 py-3 text-sm text-slate-500">
																{booking.created_at && new Date(booking.created_at).toLocaleDateString('ru-RU', {
																	day: 'numeric',
																	month: 'short',
																	year: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit'
																})}
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)
					})}

					{bookings.length === 0 && (
						<div className="bg-white rounded-xl border border-slate-200">
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<h3 className="text-md font-medium text-slate-900 mb-1">Нет записей</h3>
								<p className="text-sm text-slate-500">Все записи будут отображаться здесь</p>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Blocked Phones Tab */}
			{selectedTab === 'blocked' && (
				<div className="space-y-3">
					<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-slate-50 border-b border-slate-200">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Телефон</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Причина</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Заблокирован</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Кем</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Действия</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200">
									{blockedPhones.map((blocked) => (
										<tr key={blocked.id} className="hover:bg-slate-50">
											<td className="px-4 py-4 text-sm font-medium text-slate-900 font-mono">{formatPhone(blocked.phone)}</td>
											<td className="px-4 py-4 text-sm text-slate-700">{blocked.reason || '-'}</td>
											<td className="px-4 py-4 text-sm text-slate-500">
												{new Date(blocked.blocked_at).toLocaleDateString('ru-RU', {
													day: 'numeric',
													month: 'short',
													year: 'numeric'
												})}
											</td>
											<td className="px-4 py-4 text-sm text-slate-600">{blocked.blocked_by || '-'}</td>
											<td className="px-4 py-4">
												<button
													onClick={() => handleUnblockPhone(blocked.id)}
													disabled={processing}
													className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
												>
													Разблокировать
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{blockedPhones.length === 0 && (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
									</svg>
								</div>
								<h3 className="text-md font-medium text-slate-900 mb-1">Нет заблокированных номеров</h3>
								<p className="text-sm text-slate-500">Заблокированные номера будут отображаться здесь</p>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Block Phone Modal */}
			{showBlockModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBlockModal(false)}>
					<div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-lg font-semibold text-slate-900">Заблокировать номер</h3>
							<button
								onClick={() => setShowBlockModal(false)}
								className="text-slate-400 hover:text-slate-600 transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Номер телефона
								</label>
								<input
									type="tel"
									value={phoneToBlock}
									onChange={(e) => setPhoneToBlock(e.target.value)}
									placeholder="+7 999 999 99 99"
									disabled={blockedPhones.some(blocked => normalizePhone(blocked.phone) === normalizePhone(phoneToBlock)) && phoneToBlock !== ''}
									className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 text-slate-900 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
								/>
								{blockedPhones.some(blocked => normalizePhone(blocked.phone) === normalizePhone(phoneToBlock)) && phoneToBlock !== '' && (
									<p className="text-xs text-amber-600 mt-1">Этот номер уже заблокирован</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Причина блокировки
								</label>
								<textarea
									value={blockReason}
									onChange={(e) => setBlockReason(e.target.value)}
									placeholder="Спам, злоупотребление и т.д."
									rows={3}
									className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100 text-slate-900 placeholder-slate-400 resize-none"
								/>
							</div>
							<div className="flex gap-3 pt-2">
								<button
									onClick={() => setShowBlockModal(false)}
									className="flex-1 h-10 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
								>
									Отмена
								</button>
								<button
									onClick={handleBlockPhone}
									disabled={processing || !phoneToBlock || blockedPhones.some(blocked => normalizePhone(blocked.phone) === normalizePhone(phoneToBlock))}
									className="flex-1 h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{processing ? 'Блокировка...' : 'Заблокировать'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Clear History Confirmation Dialog */}
			{showClearHistoryConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowClearHistoryConfirm(false)}>
					<div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-start gap-4 mb-4">
							<div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-slate-900 mb-2">Очистить историю записей?</h3>
								<p className="text-sm text-slate-600">Будут удалены все записи из истории. Это действие нельзя отменить.</p>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setShowClearHistoryConfirm(false)}
								disabled={clearingHistory}
								className="flex-1 h-10 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
							>
								Отмена
							</button>
							<button
								onClick={confirmClearHistory}
								disabled={clearingHistory}
								className="flex-1 h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{clearingHistory ? 'Очистка...' : 'Очистить'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Unblock Phone Confirmation Dialog */}
			{showUnblockConfirm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUnblockConfirm(false)}>
					<div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-start gap-4 mb-4">
							<div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-slate-900 mb-2">Разблокировать номер?</h3>
								<p className="text-sm text-slate-600">Пользователь снова сможет создавать записи.</p>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								onClick={() => setShowUnblockConfirm(false)}
								disabled={processing}
								className="flex-1 h-10 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
							>
								Отмена
							</button>
							<button
								onClick={confirmUnblock}
								disabled={processing}
								className="flex-1 h-10 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{processing ? 'Разблокировка...' : 'Разблокировать'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Toast Notifications */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	)
}
