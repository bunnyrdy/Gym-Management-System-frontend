import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type {
  Member,
  MemberListItem,
  MemberStats,
  MemberStatus,
  PlanOption,
} from '@/features/members/types/member'
import type {
  MemberFormValues,
  MembershipFormValues,
  PaymentFormValues,
} from '@/features/members/schemas/member.schemas'

export interface MemberFilters {
  search?: string
  /** A membership state. `memberStatus` below is the member's own status. */
  status?: string
  memberStatus?: string
  planId?: number
  /**
   * paid | partial | pending, or `owing` for the two of them together -- what
   * the Pending Payments screen asks for.
   */
  paymentStatus?: string
  /** `this_month`, resolved server-side against the branch clock. */
  joined?: string
  /** name (default) | balance_desc. Omitted, the list sorts as it always has. */
  sort?: string
  page?: number
  pageSize?: number
}

/**
 * The API takes multipart/form-data so the photo travels with the fields.
 * Empty strings are dropped rather than sent — the server treats "" on a
 * nullable field differently from absent, and we want absent.
 */
function toFormData(
  values: MemberFormValues,
  photo?: File | null,
  removePhoto?: boolean,
): FormData {
  const fd = new FormData()

  const put = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return
    fd.append(key, String(value))
  }

  put('FullName', values.fullName)
  put('Phone', values.phone)
  put('Email', values.email)
  put('Gender', values.gender)
  put('DateOfBirth', values.dateOfBirth)
  put('Address', values.address)
  put('EmergencyContactName', values.emergencyContactName)
  put('EmergencyContactPhone', values.emergencyContactPhone)
  put('Status', values.status)
  // Sent even when false: unticking is a withdrawal of consent and has to
  // reach the server, so this must never be filtered out as "empty".
  put('MarketingOptIn', values.marketingOptIn)
  put('Notes', values.notes)

  put('PlanId', values.planId)
  put('JoiningDate', values.joiningDate)
  put('ExpiryDate', values.expiryDate)
  put('DiscountAmount', values.discountAmount)
  put('PaidAmount', values.paidAmount)
  put('PaymentMethod', values.paymentMethod)

  // Cash has no transaction to reference. The server drops it too — this just
  // stops a stale value from ever leaving the browser.
  if (values.paymentMethod !== 'cash') put('PaymentReferenceNo', values.paymentReferenceNo)

  if (photo) fd.append('photo', photo)
  if (removePhoto) fd.append('removePhoto', 'true')

  return fd
}

/** Renewals post JSON — there is no photo to carry. */
function toMembershipPayload(values: MembershipFormValues) {
  const num = (v: unknown) => (v === '' || v === undefined || v === null ? 0 : Number(v))
  const clean = (v: string | undefined) => {
    const trimmed = v?.trim()
    return trimmed ? trimmed : undefined
  }

  return {
    planId: Number(values.planId),
    startDate: values.startDate,
    expiryDate: clean(values.expiryDate),
    discountAmount: num(values.discountAmount),
    paidAmount: num(values.paidAmount),
    paymentMethod: values.paymentMethod,
    paymentReferenceNo:
      values.paymentMethod === 'cash' ? undefined : clean(values.paymentReferenceNo),
    notes: clean(values.notes),
  }
}

export const memberService = {
  list: (filters: MemberFilters = {}) =>
    api.get<PagedResult<MemberListItem>>('/members', { params: filters }),

  stats: () => api.get<MemberStats>('/members/stats'),

  get: (id: number) => api.get<Member>(`/members/${id}`),

  create: (values: MemberFormValues, photo?: File | null) =>
    api.post<Member>('/members', toFormData(values, photo)),

  update: (id: number, values: MemberFormValues, photo?: File | null, removePhoto?: boolean) =>
    api.put<Member>(`/members/${id}`, toFormData(values, photo, removePhoto)),

  /**
   * Activate / deactivate. Reversible, and the member stays on the list — the
   * Inactive filter is built from this field. Nothing else is touched.
   */
  setStatus: (id: number, status: MemberStatus) =>
    api.patch(`/members/${id}/status`, { status }),

  /** DPDP erasure. Irreversible — personal data is overwritten in place. */
  erase: (id: number) => api.post(`/members/${id}/erase`),

  /** Sells a new membership: the "Renew / New" button. */
  renew: (id: number, values: MembershipFormValues) =>
    api.post<Member>(`/members/${id}/memberships`, toMembershipPayload(values)),

  /**
   * Edits the membership in force: a plan change, an extension, a corrected
   * expiry or discount. Money already collected is deliberately not sent —
   * payments are a ledger, and the way to change one is to add another row.
   */
  updateMembership: (id: number, membershipId: number, values: MembershipFormValues) =>
    api.put<Member>(`/members/${id}/memberships/${membershipId}`, {
      planId: Number(values.planId),
      startDate: values.startDate,
      expiryDate: values.expiryDate?.trim() || undefined,
      discountAmount:
        values.discountAmount === '' || values.discountAmount === undefined
          ? 0
          : Number(values.discountAmount),
    }),

  /** Records one payment against an existing membership. */
  addPayment: (id: number, membershipId: number, values: PaymentFormValues) =>
    api.post<Member>(`/members/${id}/memberships/${membershipId}/payments`, {
      amount: Number(values.amount),
      method: values.method,
      referenceNo:
        values.method === 'cash' ? undefined : values.referenceNo?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    }),
}

export const memberLookupService = {
  plans: () => api.get<PlanOption[]>('/lookups/plans'),
}
