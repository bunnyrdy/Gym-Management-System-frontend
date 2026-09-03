import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CalendarClock, CheckCircle2, UserMinus, Users, Wallet } from 'lucide-react'
import {
  useMemberList,
  useMemberStats,
  usePlanOptions,
  useSetMemberStatus,
} from '@/features/members/hooks/use-members'
import { useMemberFilters } from '@/features/members/hooks/use-member-filters'
import { MemberFilterBar } from '@/features/members/components/member-filter-bar'
import {
  MemberStatusChip,
  MembershipStateChip,
} from '@/features/members/components/member-status-chip'
import { formatDate, type MemberListItem } from '@/features/members/types/member'
import { formatMoney } from '@/utils/currency'
import { ListHeader, SummaryCard, TableCard } from '@/components/ui/list-shell'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ROUTES } from '@/constants/routes'

const HEADERS = ['Member', 'Contact', 'Plan', 'Expiry Date', 'Status', '']

export default function MemberListPage() {
  const f = useMemberFilters()
  const { data, isLoading, isError } = useMemberList(f.query)
  const stats = useMemberStats()
  const plans = usePlanOptions()
  const setStatus = useSetMemberStatus()

  // Activating is harmless and fires straight away; deactivating cuts the
  // member off from everything the gym sends them, so it asks first.
  const [deactivating, setDeactivating] = useState<MemberListItem | null>(null)

  const rows = data?.items ?? []

  return (
    <>
      <ListHeader
        title="Members"
        subtitle="Manage gym members, memberships, payments and status."
        addLabel="Add Member"
        addRoute={ROUTES.MEMBER_NEW}
      />

      {/* Six across from xl up — one line on the desktop this is used on —
          falling to three, two and one so the row is never crushed. Total spans
          active and inactive; the three membership-state cards count active
          members only. */}
      <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Total Members" value={stats.data?.totalMembers ?? 0} icon={Users} tone="text-primary-container" />
        <SummaryCard label="Active" value={stats.data?.active ?? 0} icon={CheckCircle2} tone="text-status-active" />
        <SummaryCard label="Inactive" value={stats.data?.inactive ?? 0} icon={UserMinus} tone="text-on-surface-variant" />
        <SummaryCard label="Expiring Soon" value={stats.data?.expiringSoon ?? 0} icon={CalendarClock} tone="text-status-pending" />
        <SummaryCard label="Expired" value={stats.data?.expired ?? 0} icon={AlertCircle} tone="text-status-expired" />
        <SummaryCard label="Pending Payments" value={stats.data?.pendingPayments ?? 0} icon={Wallet} tone="text-status-pending" to={ROUTES.MEMBERS_PENDING} />
      </div>

      {/* The outstanding total is money, not a count, so it does not belong in
          a SummaryCard — that component renders a bare number. */}
      {(stats.data?.pendingPaymentsValue ?? 0) > 0 && (
        <p className="mb-md font-mono text-label-md text-on-surface-variant">
          {formatMoney(stats.data!.pendingPaymentsValue)} outstanding across{' '}
          {stats.data!.pendingPayments} member{stats.data!.pendingPayments === 1 ? '' : 's'}.
        </p>
      )}

      <MemberFilterBar {...f.filters} plans={plans.data ?? []} onChange={f.update} />

      <TableCard
        headers={HEADERS}
        page={data?.page}
        totalPages={data?.totalPages}
        totalCount={data?.totalCount}
        onPage={f.setPage}
      >
        {isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center"><Spinner className="mx-auto text-primary-container" /></td></tr>
        )}

        {isError && !isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-error">Could not load members.</td></tr>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <tr>
            <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
              No members {f.isFiltered ? 'match these filters' : 'yet'}.
            </td>
          </tr>
        )}

        {rows.map((m) => (
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

            <td className="px-md py-sm">
              <div className="truncate text-body-md text-on-surface">{m.email ?? '—'}</div>
              <div className="font-mono text-label-sm text-on-surface-variant">{m.phone}</div>
            </td>

            <td className="px-md py-sm text-body-md text-on-surface">{m.planName ?? '—'}</td>

            <td className="px-md py-sm">
              <div className="text-body-md text-on-surface">{formatDate(m.endDate)}</div>
              {m.daysRemaining !== null && m.membershipState !== 'expired' && (
                <div className="font-mono text-label-sm text-on-surface-variant">
                  {m.daysRemaining} day{m.daysRemaining === 1 ? '' : 's'} left
                </div>
              )}
              {(m.balanceAmount ?? 0) > 0 && (
                <div className="font-mono text-label-sm text-status-pending">
                  {formatMoney(m.balanceAmount!)} due
                </div>
              )}
            </td>

            <td className="px-md py-sm">
              <div className="flex flex-wrap items-center gap-1">
                {m.memberStatus === 'inactive' ? (
                  <MemberStatusChip status={m.memberStatus} />
                ) : (
                  <MembershipStateChip state={m.membershipState} />
                )}
              </div>
            </td>

            <td className="px-md py-sm">
              <div className="flex items-center justify-end gap-md">
                {m.memberStatus === 'active' ? (
                  <button
                    type="button"
                    onClick={() => setDeactivating(m)}
                    className="font-mono text-label-md text-on-surface-variant hover:text-error"
                    aria-label={`Deactivate ${m.fullName}`}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStatus.mutate({ id: m.id, status: 'active' })}
                    disabled={setStatus.isPending}
                    className="font-mono text-label-md text-status-active hover:text-on-surface disabled:opacity-50"
                    aria-label={`Activate ${m.fullName}`}
                  >
                    Activate
                  </button>
                )}

                <Link
                  to={ROUTES.memberDetails(m.id)}
                  className="font-mono text-label-md text-primary-container hover:text-primary"
                  aria-label={`Open ${m.fullName}`}
                >
                  View
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </TableCard>

      <ConfirmDialog
        open={deactivating !== null}
        title="Deactivate this member?"
        body={`${deactivating?.fullName ?? 'This member'} will move to the Inactive list and stop receiving anything the gym sends. Their membership, payments and history are kept, and you can activate them again at any time.`}
        confirmLabel="Deactivate"
        loading={setStatus.isPending}
        onCancel={() => setDeactivating(null)}
        onConfirm={() =>
          setStatus.mutate(
            { id: deactivating!.id, status: 'inactive' },
            { onSettled: () => setDeactivating(null) },
          )
        }
      />
    </>
  )
}
