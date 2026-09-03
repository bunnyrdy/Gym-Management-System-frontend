import { formatAmount } from '@/utils/currency'

/** The member's own state — NOT the staff vocabulary. See the DB CHECK. */
export type MemberStatus = 'active' | 'inactive' | 'frozen' | 'banned'

/** Derived by v_member_overview from the latest membership's end date. */
export type MembershipState = 'active' | 'expiring_soon' | 'expired' | 'no_membership'

/** Derived from the payments ledger, never stored. */
export type PaymentStatus = 'paid' | 'partial' | 'pending'

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'upi' | 'other'

export type DurationUnit = 'day' | 'week' | 'month'

/** One option in the form's plan select, served by /lookups/plans. */
export interface PlanOption {
  id: number
  name: string
  durationValue: number
  durationUnit: DurationUnit
  price: number
}

/** One transaction against a membership. The ledger, not a summary. */
export interface PaymentLine {
  id: number
  amount: number
  method: PaymentMethod
  referenceNo: string | null
  paidAt: string
  status: string
  notes: string | null
}

/** One row of a member's purchase history. */
export interface MembershipHistoryItem {
  id: number
  planId: number
  planName: string
  startDate: string
  endDate: string
  planPrice: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  paymentStatus: PaymentStatus
  status: string
  daysRemaining: number
  payments: PaymentLine[]
}

/** A membership row's own status, as opposed to the derived MembershipState. */
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'frozen' | 'upcoming'

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  cancelled: 'Cancelled',
  frozen: 'Frozen',
  upcoming: 'Upcoming',
}

export interface Member {
  id: number
  memberCode: string
  fullName: string
  phone: string
  email: string | null
  gender: string | null
  dateOfBirth: string | null
  address: string | null
  photoUrl: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  joinedOn: string
  status: MemberStatus
  /** DPDP consent for offers. Renewal reminders do not consult it. */
  marketingOptIn: boolean
  notes: string | null
  createdAt: string
  currentMembership: MembershipHistoryItem | null
  history: MembershipHistoryItem[]
}

/** The list table's shape — one row of v_member_overview. */
export interface MemberListItem {
  id: number
  memberCode: string
  fullName: string
  phone: string
  email: string | null
  photoUrl: string | null
  memberStatus: MemberStatus
  planName: string | null
  endDate: string | null
  daysRemaining: number | null
  membershipState: MembershipState
  paidAmount: number | null
  balanceAmount: number | null
  paymentStatus: PaymentStatus | null
  /** Lets a row open Record Payment without first loading the member. */
  membershipId: number | null
  joinedOn: string | null
}

/**
 * The six cards above the table.
 *
 * `totalMembers` spans active and inactive alike. `active` / `expiringSoon` /
 * `expired` are membership states counted over active members only, so a
 * deactivated member is never counted in two cards at once.
 */
export interface MemberStats {
  totalMembers: number
  active: number
  expiringSoon: number
  expired: number
  pendingPayments: number
  pendingPaymentsValue: number
  inactive: number
}

export const STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  frozen: 'Frozen',
  banned: 'Banned',
}

export const MEMBERSHIP_STATE_LABELS: Record<MembershipState, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  no_membership: 'No Membership',
  
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  partial: 'Partial',
  pending: 'Pending',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Credit/Debit Card',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI / Online',
  other: 'Other',
}

export const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  undisclosed: 'Prefer not to say',
}

const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  day: 'Days',
  week: 'Weeks',
  month: 'Months',
}

/** "12 Months", "1 Month" — the design writes the singular when the value is 1. */
export function durationLabel(value: number, unit: DurationUnit): string {
  const plural = DURATION_UNIT_LABELS[unit]
  return `${value} ${value === 1 ? plural.slice(0, -1) : plural}`
}

/**
 * The C# and SQL rule, restated for the form's live preview only:
 *   end = start + duration - 1 day
 * The server recomputes it; this exists so the field fills in as you type
 * rather than after a round trip.
 */
export function expiryFor(start: string, value: number, unit: DurationUnit): string {
  if (!start || !value) return ''
  const d = new Date(`${start}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''

  if (unit === 'day') d.setDate(d.getDate() + value)
  else if (unit === 'week') d.setDate(d.getDate() + value * 7)
  else d.setMonth(d.getMonth() + value)

  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** The same three-way rule as v_membership_balance. */
export function paymentStatusFor(total: number, paid: number): PaymentStatus {
  if (total > 0 && paid >= total) return 'paid'
  return paid > 0 ? 'partial' : 'pending'
}

/**
 * Digits only — every screen renders the ₹ as its own element so it can be
 * sized separately. Grouping and symbol live in utils/currency.
 */
export function formatPrice(value: number): string {
  return formatAmount(value)
}

/**
 * "12 Mar 2026". Re-exported from utils/date rather than defined here: the
 * staff screens had grown their own identical copy, and a date format that
 * drifts between two screens of the same app is a bug waiting to be noticed.
 */
export { formatDate } from '@/utils/date'
