import { Chip, type ChipTone } from '@/components/ui/status-chip'
import {
  MEMBERSHIP_STATE_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
  type MemberStatus,
  type MembershipState,
  type PaymentStatus,
} from '@/features/members/types/member'

/**
 * Members have three separate vocabularies and the screens show all three, so
 * each gets its own chip rather than one overloaded component.
 *
 * These live here rather than in ui/status-chip.tsx because that file already
 * hard-codes the staff vocabulary; adding a second one to it would make a
 * shared primitive depend on two features at once.
 */

const stateTones: Record<MembershipState, ChipTone> = {
  active: 'active',
  expiring_soon: 'pending',
  expired: 'error',
  no_membership: 'inactive',
}

/** What the list's Status column shows: how the *membership* stands. */
export function MembershipStateChip({
  state,
  className,
}: {
  state: MembershipState
  className?: string
}) {
  return <Chip tone={stateTones[state]} label={MEMBERSHIP_STATE_LABELS[state]} className={className} />
}

const memberTones: Record<MemberStatus, ChipTone> = {
  active: 'active',
  inactive: 'inactive',
  frozen: 'pending',
  banned: 'error',
}

/** The member's own account state, shown on the detail and summary panels. */
export function MemberStatusChip({
  status,
  className,
}: {
  status: MemberStatus
  className?: string
}) {
  return <Chip tone={memberTones[status]} label={STATUS_LABELS[status]} className={className} />
}

const paymentTones: Record<PaymentStatus, ChipTone> = {
  paid: 'active',
  partial: 'pending',
  pending: 'error',
}

export function PaymentStatusChip({
  status,
  className,
}: {
  status: PaymentStatus
  className?: string
}) {
  return <Chip tone={paymentTones[status]} label={PAYMENT_STATUS_LABELS[status]} className={className} />
}
