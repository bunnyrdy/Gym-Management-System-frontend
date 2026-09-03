import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Mail, Pencil, Phone, RefreshCw, SquarePen, Wallet } from 'lucide-react'
import { useMember } from '@/features/members/hooks/use-members'
import { MembershipHistoryCard } from '@/features/members/components/membership-history-card'
import {
  MemberStatusChip,
  MembershipStateChip,
  PaymentStatusChip,
} from '@/features/members/components/member-status-chip'
import { formatDate, type MembershipState } from '@/features/members/types/member'
import { formatMoney } from '@/utils/currency'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/common/alert'
import { RecordPaymentDialog } from '@/features/members/components/record-payment-dialog'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

/**
 * Member Details — profile, current membership, purchase history.
 *
 * The membership state shown here is derived the same way the list derives it,
 * from the end date rather than from a stored flag, so a membership that lapsed
 * overnight reads as expired without anything having run.
 */
// The two action recipes this page repeats, lifted so the inactive variants are
// a modifier rather than a fifth copy of the string.
const secondaryAction =
  'flex items-center gap-xs rounded-md border border-secondary-container px-md py-2 font-mono text-label-md text-on-surface transition-colors hover:bg-surface-container-low'
const primaryAction =
  'flex items-center gap-xs rounded-md bg-primary-container px-md py-2 font-mono text-label-md font-bold text-on-primary transition-colors hover:bg-primary'

// A <Link> has no disabled state, so an unavailable one is rendered as a span.
const offAction = 'pointer-events-none opacity-50'
const OFF_REASON = 'This member is inactive. Activate them to change their membership.'

function stateFor(endDate: string | null | undefined): MembershipState {
  if (!endDate) return 'no_membership'
  const end = new Date(`${endDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Math.round((end.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'expired'
  return days <= 7 ? 'expiring_soon' : 'active'
}

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const memberId = id ? Number(id) : undefined
  const { data: member, isLoading, isError } = useMember(memberId)
  const [recordingPayment, setRecordingPayment] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-xl">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  if (isError || !member) {
    return <Alert variant="error">Could not load this member.</Alert>
  }

  const current = member.currentMembership

  // Deactivated members are read-only where it counts: nothing may be sold to
  // them, corrected on them or collected from them until they are activated
  // again — which happens from the members list, and lands here on its own
  // because the status mutation invalidates the whole `members` query key.
  const inactive = member.status !== 'active'

  return (
    <>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <div>
          <nav className="mb-2 font-mono text-label-sm text-on-surface-variant" aria-label="Breadcrumb">
            <Link to={ROUTES.MEMBERS} className="transition-colors hover:text-primary">Members</Link>
            <span className="mx-1">/</span>
            <span className="text-on-surface">{member.memberCode}</span>
          </nav>
          <h1 className="text-headline-lg text-on-background">Member Details</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Manage profile, membership and payment history.
          </p>
        </div>

        {/* Deliberately still live while the member is inactive: this is the
            form that carries the Active switch, so it is the way back. */}
        <Link to={ROUTES.memberEdit(member.id)} className={secondaryAction}>
          <Pencil className="h-4 w-4" aria-hidden /> Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-lg lg:grid-cols-12">
        {/* Profile */}
        <aside className="lg:col-span-4">
          <div className="card-surface flex flex-col items-center border border-surface-container-highest p-md">
            <Avatar
              name={member.fullName}
              src={member.photoUrl}
              className="mb-4 h-28 w-28 border-4 border-surface text-headline-lg"
            />
            <h2 className="text-headline-md text-on-surface">{member.fullName}</h2>
            <p className="mb-2 font-mono text-label-sm text-on-surface-variant">
              ID: {member.memberCode} · Member since {formatDate(member.joinedOn)}
            </p>
            <MemberStatusChip status={member.status} className="mb-md" />

            <dl className="w-full space-y-sm border-t border-surface-container pt-md">
              <div className="flex items-center gap-sm">
                <Phone className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                <dd className="truncate text-body-md text-on-surface">{member.phone}</dd>
              </div>
              <div className="flex items-center gap-sm">
                <Mail className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                <dd className="truncate text-body-md text-on-surface">{member.email ?? '—'}</dd>
              </div>
              {member.emergencyContactName && (
                <div className="flex items-center gap-sm">
                  <CalendarDays className="h-4 w-4 shrink-0 text-on-surface-variant" aria-hidden />
                  <dd className="truncate text-body-md text-on-surface">
                    {member.emergencyContactName}
                    {member.emergencyContactPhone ? ` · ${member.emergencyContactPhone}` : ''}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>

        <div className="flex flex-col gap-lg lg:col-span-8">
          {/* Current membership */}
          <section className="card-surface border border-surface-container-highest">
            <header className="flex flex-wrap items-center justify-between gap-sm border-b border-surface-container px-md py-sm">
              <h2 className="text-headline-md text-on-surface">Current Membership</h2>

              <div className="flex flex-wrap items-center gap-sm">
                {/* Everything that changes a membership after it is sold lives
                    here: take another payment, correct the agreement, or start
                    a new one. */}
                {current && current.balanceAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setRecordingPayment(true)}
                    disabled={inactive}
                    title={inactive ? OFF_REASON : undefined}
                    className={cn(secondaryAction, 'disabled:opacity-50')}
                  >
                    <Wallet className="h-4 w-4" aria-hidden /> Record Payment
                  </button>
                )}

                {current &&
                  (inactive ? (
                    <span className={cn(secondaryAction, offAction)} aria-disabled title={OFF_REASON}>
                      <SquarePen className="h-4 w-4" aria-hidden /> Edit
                    </span>
                  ) : (
                    <Link
                      to={ROUTES.memberMembershipEdit(member.id, current.id)}
                      className={secondaryAction}
                    >
                      <SquarePen className="h-4 w-4" aria-hidden /> Edit
                    </Link>
                  ))}

                {inactive ? (
                  <span className={cn(primaryAction, offAction)} aria-disabled title={OFF_REASON}>
                    <RefreshCw className="h-4 w-4" aria-hidden /> Renew / New
                  </span>
                ) : (
                  <Link to={ROUTES.memberMembership(member.id)} className={primaryAction}>
                    <RefreshCw className="h-4 w-4" aria-hidden /> Renew / New
                  </Link>
                )}
              </div>
            </header>

            {current ? (
              <dl className="grid grid-cols-1 gap-md p-md sm:grid-cols-2 xl:grid-cols-4">
                <Fact label="Plan" value={current.planName} />
                <Fact
                  label="Dates"
                  value={`${formatDate(current.startDate)} – ${formatDate(current.endDate)}`}
                />
                <div>
                  <dt className="mb-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Status
                  </dt>
                  {/* A deactivated member's membership state is not something
                      the front desk should act on — how many days are left does
                      not matter while nothing may be sold or collected. The
                      member's own status replaces it, exactly as in the list. */}
                  <dd className="flex flex-wrap items-center gap-2">
                    {inactive ? (
                      <MemberStatusChip status={member.status} />
                    ) : (
                      <>
                        <MembershipStateChip state={stateFor(current.endDate)} />
                        {current.daysRemaining >= 0 && (
                          <span className="font-mono text-label-sm text-on-surface-variant">
                            {current.daysRemaining} day{current.daysRemaining === 1 ? '' : 's'} left
                          </span>
                        )}
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Financials
                  </dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-label-md font-bold text-on-surface">
                      {formatMoney(current.paidAmount)} paid
                    </span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      / {formatMoney(current.balanceAmount)} due
                    </span>
                    <PaymentStatusChip status={current.paymentStatus} />
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="px-md py-lg text-body-md text-on-surface-variant">
                No active membership. Use <span className="font-bold">Renew / New</span> to sell one.
              </p>
            )}
          </section>

          <MembershipHistoryCard history={member.history} />
        </div>
      </div>

      {current && (
        <RecordPaymentDialog
          open={recordingPayment}
          memberId={member.id}
          membershipId={current.id}
          outstanding={current.balanceAmount}
          onClose={() => setRecordingPayment(false)}
        />
      )}
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="text-body-md font-semibold text-on-surface">{value}</dd>
    </div>
  )
}
