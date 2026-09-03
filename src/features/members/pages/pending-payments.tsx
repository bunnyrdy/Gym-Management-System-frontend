import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, IndianRupee } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { ListHeader, SummaryCard, TableCard } from '@/components/ui/list-shell'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/constants/routes'
import { formatMoney } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { RecordPaymentDialog } from '@/features/members/components/record-payment-dialog'
import { useMemberList, useMemberStats } from '@/features/members/hooks/use-members'
import type { MemberListItem } from '@/features/members/types/member'

const HEADERS = ['Member', 'Plan', 'Expiry', 'Total', 'Paid', 'Balance Due', '']

const PAGE_SIZE = 20

/**
 * Who still owes money, largest debt first.
 *
 * A work queue rather than a filter on the members list: the front desk works
 * this list top to bottom and takes a payment against each row, which is a
 * different job from finding one person. It reads the same `/api/members`
 * endpoint with `paymentStatus=owing`, so there is one list projection to keep
 * in step rather than two.
 *
 * "Owing" is pending plus partial — someone who has paid half still owes.
 * Deactivated members are included on purpose: deactivating is a reversible
 * switch and it does not cancel the debt. That matches the Pending Payments
 * card, which counts money over everyone.
 */
export default function PendingPaymentsPage() {
  const [page, setPage] = useState(1)
  const [paying, setPaying] = useState<MemberListItem | null>(null)

  const { data, isLoading, isError } = useMemberList({
    paymentStatus: 'owing',
    sort: 'balance_desc',
    page,
    pageSize: PAGE_SIZE,
  })
  const stats = useMemberStats()

  const rows = data?.items ?? []

  return (
    <>
      <ListHeader
        title="Pending Payments"
        subtitle="Members with a balance outstanding on the membership in force."
      />

      <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-2">
        <SummaryCard
          label="Members Owing"
          value={stats.data?.pendingPayments ?? 0}
          icon={Wallet}
          tone="text-status-pending"
        />
        <SummaryCard
          label="Total Outstanding"
          value={formatMoney(stats.data?.pendingPaymentsValue ?? 0)}
          icon={IndianRupee}
          tone="text-status-pending"
          hint="across every member, active or not"
        />
      </div>

      <TableCard
        headers={HEADERS}
        page={data?.page}
        totalPages={data?.totalPages}
        totalCount={data?.totalCount}
        onPage={setPage}
      >
        {isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center"><Spinner className="mx-auto text-primary-container" /></td></tr>
        )}

        {isError && !isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-error">Could not load pending payments.</td></tr>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <tr>
            <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
              No pending payments. Every membership is settled.
            </td>
          </tr>
        )}

        {rows.map((m) => {
          // Never stored, always summed: the ledger is the only source of what
          // has been paid, so the total is reconstructed from its two halves.
          const paid = m.paidAmount ?? 0
          const balance = m.balanceAmount ?? 0

          return (
            <tr key={m.id} className="transition-colors hover:bg-surface-container-low">
              <td className="px-md py-sm">
                <div className="flex items-center gap-sm">
                  <Avatar name={m.fullName} src={m.photoUrl} className="h-10 w-10 text-label-md" />
                  <div className="min-w-0">
                    <div className="truncate text-body-md font-semibold text-on-surface">{m.fullName}</div>
                    <div className="font-mono text-label-sm text-on-surface-variant">ID: {m.memberCode}</div>
                  </div>
                </div>
              </td>

              <td className="px-md py-sm text-body-md text-on-surface-variant">{m.planName ?? '—'}</td>

              <td className="px-md py-sm font-mono text-label-md text-on-surface">
                {formatDate(m.endDate)}
              </td>

              <td className="px-md py-sm font-mono text-label-md text-on-surface-variant">
                {formatMoney(paid + balance)}
              </td>

              <td className="px-md py-sm font-mono text-label-md text-on-surface-variant">
                {formatMoney(paid)}
              </td>

              <td className="px-md py-sm font-mono text-label-md font-bold text-status-pending">
                {formatMoney(balance)}
              </td>

              <td className="px-md py-sm">
                <div className="flex items-center justify-end gap-md">
                  {/* membershipId comes down on the row precisely so this does
                      not need a round trip to the member first. */}
                  {m.membershipId !== null && (
                    <button
                      type="button"
                      onClick={() => setPaying(m)}
                      className="font-mono text-label-md font-bold text-primary-container hover:underline"
                    >
                      Record Payment
                    </button>
                  )}
                  <Link
                    to={ROUTES.memberDetails(m.id)}
                    className="font-mono text-label-md text-on-surface-variant hover:text-primary-container"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          )
        })}
      </TableCard>

      {/* The same dialog the member details screen uses, so the partial-payment
          rules and the validation are the tested ones. */}
      {paying?.membershipId != null && (
        <RecordPaymentDialog
          open
          memberId={paying.id}
          membershipId={paying.membershipId}
          outstanding={paying.balanceAmount ?? 0}
          onClose={() => setPaying(null)}
        />
      )}
    </>
  )
}
