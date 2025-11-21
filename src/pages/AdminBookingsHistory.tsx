import { useState, useEffect } from 'react'
import { getAllBookings, deleteAllBookings } from '../lib/bookings'
import type { BookingFull } from '../types/booking'
import Toast from '../components/Toast'

export default function AdminBookingsHistory() {
	const [bookings, setBookings] = useState<BookingFull[]>([])
	const [loading, setLoading] = useState(true)

	// Clear history confirmation
	const [clearingHistory, setClearingHistory] = useState(false)
	const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false)

	// Expandable groups
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

	// Toast notifications
	const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

	useEffect(() => {
		loadData()
	}, [])

	async function loadData() {
		setLoading(true)
		try {
			const bookingsData = await getAllBookings()
			setBookings(bookingsData)
		} catch (error) {
			console.error('Error loading data:', error)
		} finally {
			setLoading(false)
		}
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
		// Then by latest (most recent) booking date - newest first
		const latestA = Math.max(...a[1].map(b => new Date(b.created_at || 0).getTime()))
		const latestB = Math.max(...b[1].map(b => new Date(b.created_at || 0).getTime()))
		return latestB - latestA
	})

	return (
		<div className="space-y-3">
			{/* Header with Clear History Button */}
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl font-semibold text-slate-900">
					Все записи ({bookings.length})
				</h2>

				{bookings.length > 0 && (
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
			</div>

			{/* Bookings List */}
			<div className="space-y-2">
				{sortedPhoneGroups.map(([phone, phoneBookings]) => {
					const earliestBooking = phoneBookings.reduce((earliest, current) => {
						return new Date(current.created_at || 0) < new Date(earliest.created_at || 0) ? current : earliest
					})
					const isExpanded = expandedGroups.has(phone)

					return (
						<div key={phone} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
							{/* Group Header - Clickable */}
							<div
								onClick={() => toggleGroup(phone)}
								className="w-full bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer"
							>
								<div className="flex items-center gap-4 flex-1">
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
