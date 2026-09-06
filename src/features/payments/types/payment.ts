import type { PaymentMethod, PaymentStatus } from '@/features/members/types/member'

/**
 * A transaction's own status, from the payments CHECK constraint.
 *
 * Every write path hard-codes `completed` and there is no refund or failure
 * path, so this is a constant in practice. It is on the row because it is the
 * truth about that row, but it is deliberately NOT what the Status column or
 * the Status filter use — see `PaymentStatus` below, which actually varies.
 */
export type PaymentTxStatus = 'completed' | 'pending' | 'failed' | 'refunded'

/** One row of the payments ledger. Mirrors PaymentLedgerItem on the server. */
export interface PaymentLedgerItem {
  id: number
  receiptNo: string | null
  memberId: number
  memberCode: string
  memberName: string
  phone: string
  /** Null for a payment with no membership behind it. Plan, expiry and balance go null with it. */
  membershipId: number | null
  planName: string | null
  paidAt: string
  endDate: string | null
  amount: number
  /** The MEMBERSHIP's outstanding balance, repeated across its instalments. */
  balanceAmount: number | null
  method: PaymentMethod
  /** This transaction's own state. Always `completed` today. */
  status: PaymentTxStatus
  /** How much of the membership behind it is settled. What the Status column shows. */
  paymentStatus: PaymentStatus | null
  referenceNo: string | null
}

/**
 * The four cards. The three money fields arrive null for anyone outside the
 * revenue roles and their cards simply do not render — the server has already
 * made the decision and the client must never re-make it.
 */
export interface PaymentStats {
  thisMonthCollection: number | null
  totalOutstanding: number | null
  membersOwing: number
  totalPaymentsReceived: number
  totalPaymentsValue: number | null
}

/**
 * What the Status dropdown offers, on every tab.
 *
 * One vocabulary across all five, because a ledger row and a member row both
 * carry the membership's payment status. `owing` is the union of pending and
 * partial — someone who paid half still owes — and is labelled "Pending"
 * because that is what the front desk calls it. There is deliberately no option
 * for the literal `pending`: a member who has paid nothing has no payment row at
 * all (`payments` has CHECK amount > 0), so on the ledger it would always be
 * empty, and on the member tabs it hides the partial payers who make up the
 * whole queue today.
 */
export type LedgerStatusFilter = '' | 'owing' | 'partial' | 'paid'

export const LEDGER_STATUS_LABELS: Record<Exclude<LedgerStatusFilter, ''>, string> = {
  owing: 'Pending',
  partial: 'Partially Paid',
  paid: 'Fully Paid',
}
