import { z } from 'zod'

/**
 * Mirrors the server's MembershipPlanWriteRequest validation.
 *
 * This is a UX layer, not a security boundary — the API validates everything
 * again, because anything running in the browser is under the caller's control.
 * Keeping the two in step just means users see errors inline instead of after a
 * round trip.
 */
export const planSchema = z.object({
  name: z.string().trim().min(2, 'Enter the plan name').max(120, 'Name is too long'),

  durationValue: z.coerce
    .number({ error: 'Enter a duration' })
    .int('Whole numbers only')
    .min(1, 'Duration must be at least 1')
    .max(3650, 'That duration is too long'),

  durationUnit: z.enum(['day', 'week', 'month']),

  price: z.coerce
  .number({ error: "Enter a price" })
  .positive("Price must be greater than 0")
  .max(999999.99, "That price is too high"),

  description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),

  serviceIds: z.array(z.number()).max(30, 'That is too many services').default([]),

  // Blank is legal — the server generates PLN-NNNN when it is empty.
  planCode: z
    .union([
      z
        .string()
        .trim()
        .min(2, 'Plan code is too short')
        .max(40, 'Plan code is too long')
        .regex(/^[A-Za-z0-9-]+$/, 'Letters, numbers and hyphens only'),
      z.literal(''),
    ])
    .optional(),

  isActive: z.boolean().default(true),
})

export type PlanFormValues = z.input<typeof planSchema>

/**
 * Written out rather than inferred so every field is controlled from mount and
 * `formState.isDirty` means something on the edit screen.
 */
export const EMPTY_PLAN: PlanFormValues = {
  name: '',
  durationValue: 1,
  durationUnit: 'month',
  price: 0,
  description: '',
  serviceIds: [],
  planCode: '',
  isActive: true,
}
