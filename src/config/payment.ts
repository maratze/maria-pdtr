// Payment configuration for PayKeeper (Alfa-Bank) prepayment integration.
// To change the prepayment amount, update prepaymentAmount here (UI display only).
// The authoritative amount on the server side is PAYKEEPER_PREPAYMENT_AMOUNT in Supabase Secrets.
// The frontend NEVER sends the amount to the server.

export const PAYMENT_CONFIG = {
  prepaymentAmount: 1000,      // рублей — сумма предоплаты для отображения в UI
  reservationMinutes: 15,     // минут на оплату до освобождения слота
  currency: 'RUB',
  description: 'Предоплата за сеанс P-dtr',
} as const
