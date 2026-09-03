import { Avatar } from '@/components/ui/avatar'
import { MemberStatusChip } from '@/features/members/components/member-status-chip'
import {
  durationLabel,
  formatDate,
  formatPrice,
  type MemberStatus,
  type PlanOption,
} from '@/features/members/types/member'
import { CURRENCY_SYMBOL } from '@/utils/currency'

/**
 * The sticky right-hand rail on the member form: what is about to be saved,
 * shown back as it is typed.
 *
 * `member designs/code 3.html` leaves this column empty and lets the form run
 * full width. Filling it is what makes the screen match Add Trainer and Add
 * Receptionist — which both have this rail — while also honouring "use the full
 * page with minimal unused whitespace".
 */
export function MemberSummaryPanel({
  name,
  photoUrl,
  status,
  memberCode,
  plan,
  joiningDate,
  expiryDate,
  total,
  remaining,
}: {
  name: string
  photoUrl: string | null
  status: MemberStatus
  memberCode: string | null
  plan?: PlanOption
  joiningDate: string
  expiryDate: string
  total: number
  remaining: number
}) {
  return (
    <aside className="lg:sticky lg:top-[100px] lg:col-span-4">
      <div className="card-surface flex flex-col items-center overflow-hidden border border-surface-container-highest shadow-defined-lift">
        <div className="h-1.5 w-full bg-primary-container" aria-hidden />

        <div className="flex w-full flex-col items-center p-md">
          <Avatar
            name={name || '?'}
            src={photoUrl}
            className="mb-4 h-24 w-24 border-4 border-surface text-headline-md"
          />
          <h2 className="mb-1 text-center text-headline-md text-on-surface">
            {name || 'New Member'}
          </h2>
          <span className="mb-2 rounded-full bg-surface-container px-3 py-1 font-mono text-label-sm text-on-surface-variant">
            {memberCode ?? 'Code on save'}
          </span>

          <MemberStatusChip status={status} className="mb-md" />

          <div className="mb-md w-full rounded-md bg-surface-container-low p-md text-center">
            <p className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
              Total Amount
            </p>
            <p className="text-headline-lg font-bold text-primary-container">
              <span className="text-headline-md">{CURRENCY_SYMBOL}</span>
              {formatPrice(total)}
            </p>
            {remaining > 0 && (
              <p className="mt-1 font-mono text-label-sm text-status-pending">
                {CURRENCY_SYMBOL}
                {formatPrice(remaining)} outstanding
              </p>
            )}
          </div>

          <dl className="w-full space-y-1">
            <SummaryRow label="Plan" value={plan?.name ?? '—'} />
            <SummaryRow
              label="Duration"
              value={plan ? durationLabel(plan.durationValue, plan.durationUnit) : '—'}
            />
            <SummaryRow label="Joined" value={formatDate(joiningDate)} />
            <SummaryRow label="Expires" value={formatDate(expiryDate)} />
          </dl>
        </div>
      </div>
    </aside>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-md border-b border-surface-container py-2 last:border-0">
      <dt className="shrink-0 font-mono text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="truncate text-body-md font-semibold text-on-surface" title={value}>
        {value}
      </dd>
    </div>
  )
}
