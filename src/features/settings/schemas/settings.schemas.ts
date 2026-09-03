import { z } from 'zod'

/**
 * Mirrors MessagingSettingsWriteRequest in SettingsContracts.cs, including its
 * IValidatableObject rules.
 *
 * A UX layer, not a security boundary — the API validates all of it again, and
 * the database has CHECK constraints under that. Keeping the three in step just
 * means the owner sees "the reserve must be smaller than the limit" next to the
 * field rather than after a round trip.
 *
 * No z.coerce on the number fields: coercion makes zod's input type `unknown`,
 * which stops react-hook-form's resolver from lining up with the form's own
 * value type. The inputs register with `valueAsNumber` instead, so what reaches
 * the schema is already a number.
 */
export const messagingSettingsSchema = z
  .object({
    emailsEnabled: z.boolean(),
    suspendTransactional: z.boolean(),

    dailyEmailLimit: z
      .number()
      .int('Whole emails only')
      .min(1, 'The limit must be at least 1')
      .max(100_000, 'That is higher than any plan allows'),

    highPriorityReserve: z
      .number()
      .int('Whole emails only')
      .min(0, 'Cannot be negative')
      .max(100_000, 'That is higher than any plan allows'),

    reminderDaysBefore: z
      .array(z.number().int().min(0, 'Cannot be negative').max(90, 'At most 90 days ahead'))
      .max(5, 'At most five reminders per membership'),
  })
  .refine((v) => v.highPriorityReserve < v.dailyEmailLimit, {
    path: ['highPriorityReserve'],
    message: 'The reserve must be smaller than the daily limit, or nothing ordinary could ever send.',
  })
  .refine((v) => new Set(v.reminderDaysBefore).size === v.reminderDaysBefore.length, {
    path: ['reminderDaysBefore'],
    message: 'The same reminder day is listed twice.',
  })

export type MessagingSettingsFormValues = z.infer<typeof messagingSettingsSchema>
