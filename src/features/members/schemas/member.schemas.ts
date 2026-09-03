import { z } from 'zod'

/**
 * Mirrors the server's MemberWriteRequest validation.
 *
 * This is a UX layer, not a security boundary — the API validates everything
 * again, because anything running in the browser is under the caller's control.
 * Two rules in particular are re-checked there against data the form never
 * holds: the plan's real price, and therefore the discount and paid ceilings.
 */

const phone = z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')

const optionalPhone = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
)

/** Money arrives from a number input as a string; '' means "nothing typed". */
const money = z
  .union([z.coerce.number().min(0, 'Cannot be negative'), z.literal('')])
  .optional()

export const memberSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter the full name').max(120, 'Name is too long'),
    phone,
    email: z.union([z.email('Enter a valid email'), z.literal('')]).optional(),
    gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
    address: z.string().max(300, 'Address is too long').optional().or(z.literal('')),
    emergencyContactName: z.string().max(120).optional().or(z.literal('')),
    emergencyContactPhone: optionalPhone,
    status: z.enum(['active', 'inactive', 'frozen', 'banned']),
    // DPDP consent for offers only — renewal reminders are service messages
    // about a contract this member signed and need no separate permission.
    marketingOptIn: z.boolean(),
    notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),

    planId: z.union([z.coerce.number(), z.literal('')]).optional(),
    joiningDate: z.string().min(1, 'Joining date is required'),
    expiryDate: z.string().optional().or(z.literal('')),

    discountAmount: money,
    paidAmount: money,
    paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'upi', 'other']),
    paymentReferenceNo: z.string().max(60, 'Reference is too long').optional().or(z.literal('')),

    // Not sent to the server — it is the plan's own price, carried in the form
    // so the discount rule below can see it. The server re-reads the real one.
    planPrice: z.number().optional(),

    // Create only. On edit the membership sections are read-only, so the
    // plan/money rules below must not fire.
    isEdit: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    const err = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (v.dateOfBirth) {
      const dob = new Date(v.dateOfBirth)
      const now = new Date()
      const twelve = new Date()
      twelve.setFullYear(twelve.getFullYear() - 12)
      const hundred = new Date()
      hundred.setFullYear(hundred.getFullYear() - 100)

      if (dob >= now) err('dateOfBirth', 'Date of birth must be in the past')
      else if (dob > twelve) err('dateOfBirth', 'Members must be at least 12 years old')
      else if (dob < hundred) err('dateOfBirth', 'That date looks incorrect')
    }

    if (v.isEdit) return

    if (v.planId === '' || v.planId === undefined)
      err('planId', 'Choose a membership plan')

    if (v.expiryDate && v.joiningDate && v.expiryDate < v.joiningDate)
      err('expiryDate', 'Expiry cannot be before the joining date')

    const price = v.planPrice ?? 0
    const discount = v.discountAmount === '' || v.discountAmount === undefined ? 0 : Number(v.discountAmount)
    const paid = v.paidAmount === '' || v.paidAmount === undefined ? 0 : Number(v.paidAmount)

    if (discount > price) err('discountAmount', 'Discount cannot exceed the membership price')
    else if (paid > price - discount) err('paidAmount', 'Paid amount cannot exceed the total')
  })

export type MemberFormValues = z.input<typeof memberSchema>

/** Every field written out, so formState.isDirty is meaningful. */
export const EMPTY_MEMBER: MemberFormValues = {
  fullName: '',
  phone: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  status: 'active',
  // Unticked. A pre-ticked consent box is not consent.
  marketingOptIn: false,
  notes: '',
  planId: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  expiryDate: '',
  discountAmount: '',
  paidAmount: '',
  paymentMethod: 'cash',
  paymentReferenceNo: '',
  planPrice: 0,
  isEdit: false,
}

/** The Manage Membership screen — JSON, no photo, no personal fields. */
export const membershipSchema = z
  .object({
    planId: z.union([z.coerce.number(), z.literal('')]).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    expiryDate: z.string().optional().or(z.literal('')),
    discountAmount: money,
    paidAmount: money,
    paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'upi', 'other']),
    paymentReferenceNo: z.string().max(60, 'Reference is too long').optional().or(z.literal('')),
    notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
    planPrice: z.number().optional(),
  })
  .superRefine((v, ctx) => {
    const err = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (v.planId === '' || v.planId === undefined) err('planId', 'Choose a membership plan')

    if (v.expiryDate && v.startDate && v.expiryDate < v.startDate)
      err('expiryDate', 'Expiry cannot be before the start date')

    const price = v.planPrice ?? 0
    const discount = v.discountAmount === '' || v.discountAmount === undefined ? 0 : Number(v.discountAmount)
    const paid = v.paidAmount === '' || v.paidAmount === undefined ? 0 : Number(v.paidAmount)

    if (discount > price) err('discountAmount', 'Discount cannot exceed the membership price')
    else if (paid > price - discount) err('paidAmount', 'Paid amount cannot exceed the total')
  })

export type MembershipFormValues = z.input<typeof membershipSchema>

/**
 * Recording one payment against an existing membership.
 *
 * The ceiling against the outstanding balance cannot live here — the balance
 * is not a form field — so the dialog checks it and the server re-checks it
 * against the ledger.
 */
export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  method: z.enum(['cash', 'card', 'bank_transfer', 'upi', 'other']),
  referenceNo: z.string().max(60, 'Reference is too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
})

export type PaymentFormValues = z.input<typeof paymentSchema>

export const EMPTY_PAYMENT: PaymentFormValues = {
  amount: '' as unknown as number,
  method: 'cash',
  referenceNo: '',
  notes: '',
}

export const EMPTY_MEMBERSHIP: MembershipFormValues = {
  planId: '',
  startDate: new Date().toISOString().slice(0, 10),
  expiryDate: '',
  discountAmount: '',
  paidAmount: '',
  paymentMethod: 'cash',
  paymentReferenceNo: '',
  notes: '',
  planPrice: 0,
}
