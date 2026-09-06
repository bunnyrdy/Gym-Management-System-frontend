import { AlertCircle, CalendarClock, TrendingUp, Users, Wallet, IndianRupee } from 'lucide-react'
import { SummaryCard } from '@/components/ui/list-shell'
import { ROUTES } from '@/constants/routes'
import { formatCompactMoney, formatMoney } from '@/utils/currency'
import type { DashboardKpis } from '@/features/dashboard/types/dashboard'

/**
 * The six cards along the top.
 *
 * Every card opens the list behind its own number, carrying whatever filter
 * makes that list agree with the count that was clicked: the membership-state
 * cards pass a state (and `useMemberFilters` pins memberStatus=active alongside
 * it, for exactly that reason), New Members passes the joining window, and
 * Pending Payments opens the work queue.
 *
 * Monthly Revenue was the one card with nowhere to go until the payments page
 * existed. It opens This Month's ledger now, which is the same sum broken into
 * the rows behind it — PaymentService.MonthlyCollectionAsync computes both.
 *
 * The money cards render only when the server sent the figure. A receptionist's
 * payload has them null, so the grid is five wide for them — no client-side
 * role check, because the server already made the decision.
 */
export function KpiGrid({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        label="Active Members"
        value={kpis.activeMembers}
        icon={Users}
        tone="text-primary-container"
        to={`${ROUTES.MEMBERS}?status=active`}
      />

      <SummaryCard
        label="New Members"
        value={kpis.newMembersThisMonth}
        icon={TrendingUp}
        tone="text-status-active"
        hint="this month"
        to={`${ROUTES.MEMBERS}?joined=this_month`}
      />

      <SummaryCard
        label="Expiring Soon"
        value={kpis.expiringSoon}
        icon={CalendarClock}
        tone="text-status-pending"
        accent="primary"
        to={`${ROUTES.MEMBERS}?status=expiring_soon`}
      />

      <SummaryCard
        label="Expired"
        value={kpis.expired}
        icon={AlertCircle}
        tone="text-status-expired"
        accent="error"
        to={`${ROUTES.MEMBERS}?status=expired`}
      />

      {/* The count is a work queue and everyone gets it; the total is a
          business figure and only arrives for those allowed to see it. Hence
          one card with an optional second line, not a card that disappears. */}
      <SummaryCard
        label="Pending Payments"
        value={kpis.pendingPayments}
        icon={Wallet}
        tone="text-status-pending"
        to={ROUTES.MEMBERS_PENDING}
        hint={
          kpis.pendingPaymentsValue !== null
            ? `${formatMoney(kpis.pendingPaymentsValue)} outstanding`
            : `member${kpis.pendingPayments === 1 ? '' : 's'} owing`
        }
      />

      {kpis.monthlyRevenue !== null && (
        <SummaryCard
          label="Monthly Revenue"
          value={formatCompactMoney(kpis.monthlyRevenue)}
          icon={IndianRupee}
          tone="text-primary-container"
          hint="collected this month"
          to={ROUTES.PAYMENTS}
        />
      )}
    </div>
  )
}
