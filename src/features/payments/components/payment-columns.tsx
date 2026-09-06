import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { PaymentStatusChip } from '@/features/members/components/member-status-chip'
import { PAYMENT_METHOD_LABELS, type MemberListItem } from '@/features/members/types/member'
import type { PaymentLedgerItem } from '@/features/payments/types/payment'
import { ROUTES } from '@/constants/routes'
import { formatMoney } from '@/utils/currency'
import { formatDate, formatInstantDate } from '@/utils/date'

/**
 * A table column, described rather than written out.
 *
 * The payments page shows two different row shapes — ledger transactions on
 * three tabs, members on the other two — and a descriptor list is what lets
 * one page render both without forking into two pages that drift. The tabs
 * that cannot fill a column simply omit it, rather than printing an em dash
 * three times per row.
 */
export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
}

/** What a row's Record Payment button needs to know. Both shapes can supply it. */
export interface PayTarget {
  memberId: number
  membershipId: number
  outstanding: number
}

// ---------------------------------------------------------------------------
// Shared cell renderers
// ---------------------------------------------------------------------------
// Used by both descriptor lists, so a member reads identically whichever tab
// they appear on.

function memberCell(id: number, name: string, code: string, photoUrl?: string | null) {
  return (
    <div className="flex items-center gap-sm">
      <Avatar name={name} src={photoUrl ?? null} className="h-10 w-10 text-label-md" />
      <div className="min-w-0">
        <Link
          to={ROUTES.memberDetails(id)}
          className="block truncate text-body-md font-semibold text-on-surface hover:text-primary-container"
        >
          {name}
        </Link>
        <div className="font-mono text-label-sm text-on-surface-variant">ID: {code}</div>
      </div>
    </div>
  )
}

const money = (value: number | null | undefined) => (
  <span className="font-mono text-label-md text-on-surface-variant">{formatMoney(value ?? 0)}</span>
)

/** Outstanding money is the one figure on this page that is meant to be noticed. */
const balance = (value: number | null | undefined) =>
  value && value > 0 ? (
    <span className="font-mono text-label-md font-bold text-status-pending">{formatMoney(value)}</span>
  ) : (
    <span className="font-mono text-label-md text-on-surface-variant">{formatMoney(0)}</span>
  )

const text = (value: string | null | undefined) => (
  <span className="text-body-md text-on-surface-variant">{value ?? '—'}</span>
)

/** A `DateOnly` from the API -- an expiry, a start date. */
const date = (value: string | null | undefined) => (
  <span className="font-mono text-label-md text-on-surface">{formatDate(value)}</span>
)

/**
 * A `timestamptz` -- paidAt. NOT `date` above: formatDate is date-only by
 * contract and renders an instant as an em dash, which is exactly what this
 * column used to show.
 */
const instant = (value: string | null | undefined) => (
  <span className="font-mono text-label-md text-on-surface">{formatInstantDate(value)}</span>
)

function actions(target: PayTarget | null, memberId: number, onPay: (t: PayTarget) => void) {
  return (
    <div className="flex items-center justify-end gap-md">
      {/* membershipId rides on the row precisely so this needs no round trip to
          the member first — the same reason MemberListItem carries it. */}
      {target && (
        <button
          type="button"
          onClick={() => onPay(target)}
          className="font-mono text-label-md font-bold text-primary-container hover:underline"
        >
          Record Payment
        </button>
      )}
      <Link
        to={ROUTES.memberDetails(memberId)}
        className="font-mono text-label-md text-on-surface-variant hover:text-primary-container"
      >
        View
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The ledger: This Month, Previous Payments, All Payments
// ---------------------------------------------------------------------------
/**
 * The ten columns the client specified, plus the row's own actions.
 *
 * Balance Due here is the MEMBERSHIP's outstanding balance, so a membership
 * settled in three instalments shows the same figure on all three rows — it is
 * not "what was left after this payment". The schema forbids storing that by
 * name: paid and remaining are always derived, so they can never drift apart.
 */
export function paymentColumns(onPay: (t: PayTarget) => void): Column<PaymentLedgerItem>[] {
  return [
    {
      header: 'Receipt No',
      cell: (p) => (
        <span className="font-mono text-label-md font-medium text-on-surface">{p.receiptNo ?? '—'}</span>
      ),
    },
    { header: 'Member', cell: (p) => memberCell(p.memberId, p.memberName, p.memberCode) },
    {
      header: 'Phone',
      cell: (p) => <span className="font-mono text-label-md text-on-surface-variant">{p.phone}</span>,
    },
    { header: 'Plan', cell: (p) => text(p.planName) },
    { header: 'Payment Date', cell: (p) => instant(p.paidAt) },
    { header: 'Expiry', cell: (p) => date(p.endDate) },
    { header: 'Amount Paid', cell: (p) => money(p.amount) },
    { header: 'Balance Due', cell: (p) => balance(p.balanceAmount) },
    { header: 'Method', cell: (p) => text(PAYMENT_METHOD_LABELS[p.method] ?? p.method) },
    {
      // The MEMBERSHIP's payment status, not the transaction's. The
      // transaction's is always "completed" -- a column that reads the same on
      // every row is decoration, and this is the one the Status filter narrows
      // on, so the column and the control finally describe the same thing.
      header: 'Status',
      cell: (p) => (p.paymentStatus ? <PaymentStatusChip status={p.paymentStatus} /> : text(null)),
    },
    {
      header: '',
      cell: (p) =>
        actions(
          p.membershipId !== null && (p.balanceAmount ?? 0) > 0
            ? { memberId: p.memberId, membershipId: p.membershipId, outstanding: p.balanceAmount ?? 0 }
            : null,
          p.memberId,
          onPay,
        ),
    },
  ]
}

// ---------------------------------------------------------------------------
// The member-shaped tabs
// ---------------------------------------------------------------------------
// Receipt No, Payment Date and Method are absent rather than empty: these rows
// are memberships, and there is no single transaction behind them to name.

/** Pending Payments — the work queue, largest debt first. */
export function owingColumns(onPay: (t: PayTarget) => void): Column<MemberListItem>[] {
  return [
    { header: 'Member', cell: (m) => memberCell(m.id, m.fullName, m.memberCode, m.photoUrl) },
    {
      header: 'Phone',
      cell: (m) => <span className="font-mono text-label-md text-on-surface-variant">{m.phone}</span>,
    },
    { header: 'Plan', cell: (m) => text(m.planName) },
    { header: 'Expiry', cell: (m) => date(m.endDate) },
    {
      header: 'Total',
      cell: (m) => money((m.paidAmount ?? 0) + (m.balanceAmount ?? 0)),
    },
    { header: 'Paid', cell: (m) => money(m.paidAmount) },
    { header: 'Balance Due', cell: (m) => balance(m.balanceAmount) },
    {
      header: 'Status',
      cell: (m) => (m.paymentStatus ? <PaymentStatusChip status={m.paymentStatus} /> : text(null)),
    },
    {
      header: '',
      cell: (m) =>
        actions(
          m.membershipId !== null
            ? { memberId: m.id, membershipId: m.membershipId, outstanding: m.balanceAmount ?? 0 }
            : null,
          m.id,
          onPay,
        ),
    },
  ]
}

/**
 * Expired Memberships. No Paid/Total pair: the question this tab answers is
 * who has lapsed and what they still owe, not how the last membership was
 * settled.
 */
export function expiredColumns(onPay: (t: PayTarget) => void): Column<MemberListItem>[] {
  return [
    { header: 'Member', cell: (m) => memberCell(m.id, m.fullName, m.memberCode, m.photoUrl) },
    {
      header: 'Phone',
      cell: (m) => <span className="font-mono text-label-md text-on-surface-variant">{m.phone}</span>,
    },
    { header: 'Plan', cell: (m) => text(m.planName) },
    { header: 'Expired On', cell: (m) => date(m.endDate) },
    { header: 'Balance Due', cell: (m) => balance(m.balanceAmount) },
    {
      header: 'Status',
      cell: (m) => (m.paymentStatus ? <PaymentStatusChip status={m.paymentStatus} /> : text(null)),
    },
    {
      header: '',
      cell: (m) =>
        actions(
          m.membershipId !== null && (m.balanceAmount ?? 0) > 0
            ? { memberId: m.id, membershipId: m.membershipId, outstanding: m.balanceAmount ?? 0 }
            : null,
          m.id,
          onPay,
        ),
    },
  ]
}
