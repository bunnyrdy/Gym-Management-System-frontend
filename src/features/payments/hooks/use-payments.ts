import { useQuery } from '@tanstack/react-query'
import { paymentService, type PaymentFilters } from '@/features/payments/services/payment.service'

/**
 * Exported, like the dashboard's, because the members module invalidates it:
 * recording a payment from a member's details screen has to move the payments
 * page too. The import runs one way — this file imports nothing from members.
 */
export const keys = {
  all: ['payments'] as const,
  list: (f: PaymentFilters) => ['payments', 'list', f] as const,
  stats: (f: PaymentFilters) => ['payments', 'stats', f] as const,
}

export function usePaymentList(filters: PaymentFilters, enabled = true) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => paymentService.list(filters),
    enabled,
    // Keeps the previous page on screen while the next one loads, so the table
    // doesn't collapse to a spinner on every keystroke of the search box.
    placeholderData: (prev) => prev,
  })
}

/**
 * The stats take the same filters as the list because two of the four cards
 * describe the rows currently visible. Keyed on the filters for the same
 * reason — a cached figure from another window would contradict the table.
 */
export function usePaymentStats(filters: PaymentFilters) {
  return useQuery({
    queryKey: keys.stats(filters),
    queryFn: () => paymentService.stats(filters),
    placeholderData: (prev) => prev,
  })
}
