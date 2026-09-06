import { IndianRupee, Receipt, TrendingUp, Wallet } from 'lucide-react'
import { SummaryCard } from '@/components/ui/list-shell'
import { formatMoney } from '@/utils/currency'
import type { PaymentStats } from '@/features/payments/types/payment'
import { isMemberTab, type PaymentTab } from '@/features/payments/hooks/use-payment-filters'

/**
 * The four cards, each of which selects the view behind its own number.
 *
 * These filter the page they sit on rather than navigating, which is why they
 * take `onSelect` instead of `to` — but the principle is the dashboard's: a
 * card opens the rows it counted, so the figure and the table can never
 * describe different sets.
 *
 * The three money cards render only when the server sent the figure. A
 * receptionist's payload has them null and the row is one card wide — no
 * client-side role check, because the server already made that decision and
 * duplicating it here would put the rule in two places for one of them to go
 * stale.
 */
export function PaymentKpiCards({
  stats,
  tab,
  onSelect,
}: {
  stats: PaymentStats
  tab: PaymentTab
  onSelect: (next: PaymentTab) => void
}) {
  // On the two member-shaped tabs the ledger query falls back to the whole
  // ledger, so this figure is not "what is on screen" there. Say which it is
  // rather than letting the hint claim a window it is not describing.
  const windowed = !isMemberTab(tab)

  return (
    <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-4">
      {stats.thisMonthCollection !== null && (
        <SummaryCard
          label="This Month Collection"
          value={formatMoney(stats.thisMonthCollection)}
          icon={TrendingUp}
          tone="text-status-active"
          hint="completed payments"
          onSelect={() => onSelect('this_month')}
          selected={tab === 'this_month'}
        />
      )}

      {stats.totalOutstanding !== null && (
        <SummaryCard
          label="Total Outstanding"
          value={formatMoney(stats.totalOutstanding)}
          icon={IndianRupee}
          tone="text-status-pending"
          hint="across every member, active or not"
          accent="primary"
          onSelect={() => onSelect('pending')}
          selected={tab === 'pending'}
        />
      )}

      {/* The count is a work queue and everyone sees it; the total above is a
          business figure. Both open the same tab — they are the count and the
          value of one set, the split the dashboard already makes. */}
      <SummaryCard
        label="Members Owing"
        value={stats.membersOwing}
        icon={Wallet}
        tone="text-status-pending"
        onSelect={() => onSelect('pending')}
        selected={tab === 'pending'}
      />

      <SummaryCard
        label="Total Payments Received"
        value={stats.totalPaymentsReceived}
        icon={Receipt}
        tone="text-primary-container"
        // Moves with the filter bar: it describes the rows currently in view,
        // which is what makes it useful next to a filtered table.
        hint={
          stats.totalPaymentsValue !== null
            ? `${formatMoney(stats.totalPaymentsValue)} ${windowed ? 'in view' : 'all time'}`
            : windowed
              ? 'in the current view'
              : 'all time'
        }
        onSelect={() => onSelect('all')}
        selected={tab === 'all'}
      />
    </div>
  )
}
