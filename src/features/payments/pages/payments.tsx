import { useState } from 'react'
import { ListHeader } from '@/components/ui/list-shell'
import { TabStrip, type TabItem } from '@/components/ui/tabs'
import { RecordPaymentDialog } from '@/features/members/components/record-payment-dialog'
import { useMemberList, usePlanOptions } from '@/features/members/hooks/use-members'
import { usePaymentList, usePaymentStats } from '@/features/payments/hooks/use-payments'
import {
  isMemberTab,
  usePaymentFilters,
  type PaymentTab,
} from '@/features/payments/hooks/use-payment-filters'
import { PaymentKpiCards } from '@/features/payments/components/payment-kpi-cards'
import { PaymentFilterBar } from '@/features/payments/components/payment-filter-bar'
import { PaymentsTable } from '@/features/payments/components/payments-table'
import {
  expiredColumns,
  owingColumns,
  paymentColumns,
  type PayTarget,
} from '@/features/payments/components/payment-columns'

const TABS: TabItem[] = [
  { key: 'this_month', label: 'This Month' },
  // { key: 'previous', label: 'Previous Payments' },
  { key: 'pending', label: 'Pending Payments' },
  { key: 'expired', label: 'Expired Memberships' },
  { key: 'all', label: 'All Payments' },
]

const EMPTY_MESSAGE: Record<PaymentTab, string> = {
  this_month: 'No payments taken this month yet.',
  previous: 'No payments before this month.',
  pending: 'No pending payments. Every membership is settled.',
  expired: 'No expired memberships.',
  all: 'No payments recorded yet.',
}

/**
 * The centralized payments console.
 *
 * Five tabs over two endpoints, and that split is the whole design. This Month,
 * Previous and All read the payments ledger. Pending Payments and Expired
 * Memberships read `/api/members` — those are facts MemberService already
 * computes and the dashboard already counts, so a second implementation here
 * would be exactly the drift v_member_overview exists to prevent.
 *
 * Both queries are declared unconditionally because hooks cannot be called in a
 * branch; `enabled` keeps the inactive one from fetching, so a tab change costs
 * one request, not two.
 *
 * Recording money reuses the member module's dialog verbatim — the same one the
 * details screen and the old pending-payments queue used — so the overpay rule
 * and the validation are the tested ones and there is still exactly one write
 * path for a payment.
 */
export default function PaymentsPage() {
  const f = usePaymentFilters()
  const [paying, setPaying] = useState<PayTarget | null>(null)

  const memberTab = isMemberTab(f.tab)

  const payments = usePaymentList(f.paymentQuery, !memberTab)
  const members = useMemberList(f.memberQuery, memberTab)
  // Deliberately not f.paymentQuery: paging must not refire the stats, which
  // run a full member-stats scan. The cards describe the filtered window, and
  // the window does not change when you turn the page.
  const stats = usePaymentStats(f.statsQuery)
  const plans = usePlanOptions()

  const active = memberTab ? members : payments
  const paged = active.data

  return (
    <>
      <ListHeader
        title="Payments"
        subtitle="Every payment taken, what is still owed, and who has lapsed."
      />

      {stats.data && <PaymentKpiCards stats={stats.data} tab={f.tab} onSelect={f.setTab} />}

      <TabStrip
        items={TABS}
        value={f.tab}
        onChange={(next) => f.setTab(next as PaymentTab)}
        label="Payment views"
        className="mb-md"
      />

      <PaymentFilterBar
        filters={f.filters}
        plans={plans.data ?? []}
        dirty={f.isFiltered}
        onChange={f.update}
        onClear={f.reset}
      />

      {memberTab ? (
        <PaymentsTable
          columns={f.tab === 'expired' ? expiredColumns(setPaying) : owingColumns(setPaying)}
          rows={members.data?.items ?? []}
          rowKey={(m) => m.id}
          isLoading={members.isLoading}
          isError={members.isError}
          emptyMessage={EMPTY_MESSAGE[f.tab]}
          page={f.page}
          totalPages={paged?.totalPages ?? 1}
          totalCount={paged?.totalCount ?? 0}
          onPage={f.setPage}
        />
      ) : (
        <PaymentsTable
          columns={paymentColumns(setPaying)}
          rows={payments.data?.items ?? []}
          rowKey={(p) => p.id}
          isLoading={payments.isLoading}
          isError={payments.isError}
          emptyMessage={EMPTY_MESSAGE[f.tab]}
          page={f.page}
          totalPages={paged?.totalPages ?? 1}
          totalCount={paged?.totalCount ?? 0}
          onPage={f.setPage}
        />
      )}

      {paying && (
        <RecordPaymentDialog
          open
          memberId={paying.memberId}
          membershipId={paying.membershipId}
          outstanding={paying.outstanding}
          onClose={() => setPaying(null)}
        />
      )}
    </>
  )
}
