import { History } from 'lucide-react'
import { PaymentStatusChip } from '@/features/members/components/member-status-chip'
import {
  formatDate,
  formatPrice,
  type MembershipHistoryItem,
} from '@/features/members/types/member'
import { CURRENCY_SYMBOL } from '@/utils/currency'

/**
 * The member's purchase history. Renewals are separate rows rather than edits,
 * which is exactly why this table can exist at all.
 */
export function MembershipHistoryCard({ history }: { history: MembershipHistoryItem[] }) {
  return (
    <section className="card-surface overflow-hidden border border-surface-container-highest">
      <header className="flex items-center gap-sm border-b border-surface-container px-md py-sm">
        <History className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-headline-md text-on-surface">History</h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-container-high bg-surface-bright">
              {['Plan', 'From', 'To', 'Price', 'Amount Paid', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-md py-sm font-mono text-label-sm font-medium uppercase tracking-wider text-on-surface-variant"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="px-md py-lg text-center text-body-md text-on-surface-variant">
                  No memberships yet.
                </td>
              </tr>
            )}

            {history.map((h) => (
              <tr key={h.id} className="transition-colors hover:bg-surface-container-low">
                <td className="px-md py-sm text-body-md font-semibold text-on-surface">{h.planName}</td>
                <td className="px-md py-sm text-body-md text-on-surface-variant">{formatDate(h.startDate)}</td>
                <td className="px-md py-sm text-body-md text-on-surface-variant">{formatDate(h.endDate)}</td>
                <td className="px-md py-sm font-mono text-label-md text-on-surface">
                  {CURRENCY_SYMBOL}{formatPrice(h.totalAmount)}
                </td>
                <td className="px-md py-sm font-mono text-label-md text-on-surface">
                  {CURRENCY_SYMBOL}{formatPrice(h.paidAmount)}
                </td>
                <td className="px-md py-sm">
                  <PaymentStatusChip status={h.paymentStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
