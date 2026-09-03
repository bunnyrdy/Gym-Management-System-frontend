/**
 * Money formatting. One module so the symbol is written once — a literal '$'
 * or '₹' typed into a screen is the same class of bug as a literal hex colour.
 *
 * The gym bills in rupees, so grouping is `en-IN` (1,23,456.00 — lakhs, not
 * thousands) rather than the browser's locale. Getting the symbol right but
 * leaving western grouping would still read as wrong to the client.
 *
 * When Settings grows a per-tenant currency, this is the only file that
 * changes: `tenants` gains a currency column and these constants become a
 * lookup.
 */
export const CURRENCY_CODE = 'INR'
export const CURRENCY_SYMBOL = '₹'
export const CURRENCY_LOCALE = 'en-IN'

const amountFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * The digits alone — "1,23,456.00". For layouts that render the symbol as its
 * own element so it can be sized or coloured separately.
 */
export function formatAmount(value: number): string {
  return amountFormatter.format(Number.isFinite(value) ? value : 0)
}

/**
 * The digits with the paise dropped when there are none — "1,100", but still
 * "999.50" when the price really has them.
 *
 * For price *display* on the marketing site, where "₹1,100.00" reads as an
 * invoice and "₹1,100" reads as a price. It stays here rather than in the
 * component because the grouping is still the `en-IN` lakh rule, and that is
 * exactly the decision this file exists to own.
 *
 * NOT for ledgers or receipts — anywhere the paise matter, use formatAmount.
 */
export function formatPrice(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return Number.isInteger(safe)
    ? new Intl.NumberFormat(CURRENCY_LOCALE, { maximumFractionDigits: 0 }).format(safe)
    : formatAmount(safe)
}

/** Symbol and digits together — "₹1,23,456.00". */
export function formatMoney(value: number): string {
  return `${CURRENCY_SYMBOL}${formatAmount(value)}`
}

/**
 * A short form for headline figures — "₹12.4L", "₹1.2Cr".
 *
 * The dashboard's revenue card renders one number at 48px; the full
 * "₹12,45,300.00" does not fit and is not what the figure is for at a glance.
 * Compact notation in `en-IN` gives Indian units (T / L / Cr), which is the
 * point of using the locale rather than hand-rolling a `k` suffix — "₹1.2M" is
 * as wrong to this client as western grouping would be.
 *
 * Small amounts fall through to the exact figure: "₹950" reads better than
 * "₹950" rendered compactly, and there is nothing to save.
 *
 * Three significant digits rather than one decimal place: ₹1,01,200 compacts to
 * "₹1.01L", where `maximumFractionDigits: 1` would round it to "₹1L" and throw
 * away a thousand rupees at the only place the owner reads the month's total.
 */
const compactFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  notation: 'compact',
  maximumSignificantDigits: 3,
})

export function formatCompactMoney(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  if (Math.abs(safe) < 1000) return `${CURRENCY_SYMBOL}${Math.round(safe)}`
  return `${CURRENCY_SYMBOL}${compactFormatter.format(safe)}`
}
