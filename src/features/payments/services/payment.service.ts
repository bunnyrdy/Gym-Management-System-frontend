import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type { PaymentLedgerItem, PaymentStats } from '@/features/payments/types/payment'

/**
 * The ledger's filter surface. Every field is optional; sending none is
 * "this month, newest first".
 *
 * Precedence server-side is most-specific-first: from/to beats month+year,
 * which beats range. So a custom range chosen while the This Month tab is open
 * shows the custom range.
 */
export interface PaymentFilters {
  /** Member name, member code or receipt number. */
  search?: string
  phone?: string
  /** this_month (default) | previous | all */
  range?: string
  month?: number
  year?: number
  /** Inclusive both ends, in the branch's calendar. */
  from?: string
  to?: string
  balanceDueOnly?: boolean
  /** '' | owing | partial | paid — the MEMBERSHIP's payment status, not the transaction's. */
  paymentStatus?: string
  planId?: number
  page?: number
  pageSize?: number
}

/**
 * Empty strings are dropped rather than sent. `?status=` would reach the server
 * as a value it does not recognise; absent is what "no filter" means.
 */
function params(filters: PaymentFilters): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false),
  )
}

export const paymentService = {
  list: (filters: PaymentFilters = {}) =>
    api
      .get<PagedResult<PaymentLedgerItem>>('/payments', { params: params(filters) })
      .then((r) => r.data),

  /**
   * Takes the same filters as the list: two of the four cards describe the rows
   * currently visible, so they have to be computed over the same window.
   */
  stats: (filters: PaymentFilters = {}) =>
    api.get<PaymentStats>('/payments/stats', { params: params(filters) }).then((r) => r.data),
}
