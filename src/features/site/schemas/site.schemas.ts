import { z } from 'zod'

/**
 * Mirrors the server's write DTOs in SiteContracts.cs.
 *
 * This is a UX layer, not a security boundary — the API validates everything
 * again, because anything running in the browser is under the caller's control.
 * Keeping the two in step just means users see errors inline instead of after a
 * round trip.
 */

/** http/https only. A `javascript:` URL in an href on a public page is stored XSS. */
const webUrl = z
  .union([
    z.string().trim().url('Enter a full web address').refine(
      (v) => /^https?:\/\//i.test(v),
      'The address must start with http:// or https://',
    ),
    z.literal(''),
  ])
  .optional()

export const settingsSchema = z.object({
  heroHeadline: z.string().max(120, 'Headline is too long').optional().or(z.literal('')),
  heroSubtext: z.string().max(400, 'Subtext is too long').optional().or(z.literal('')),

  // Kept as a string in the form so an empty field is "" rather than NaN; the
  // service converts it. Same for the member count.
  foundedYear: z
    .union([
      z.coerce.number().int('Whole years only').min(1900, 'That year is too early')
        .max(2200, 'That year is in the future'),
      z.literal(''),
    ])
    .optional(),

  memberCountOverride: z
    .union([
      z.coerce.number().int('Whole numbers only').min(0, 'Cannot be negative')
        .max(1_000_000, 'That is too many'),
      z.literal(''),
    ])
    .optional(),

  aboutTitle: z.string().max(160, 'Title is too long').optional().or(z.literal('')),
  aboutDescription: z.string().max(4000, 'Description is too long').optional().or(z.literal('')),

  instagramUrl: webUrl,
  mapsUrl: webUrl,

  whatsappNumber: z
    .union([
      z.string().trim().regex(/^\+?[0-9\s-]{6,20}$/, 'Digits, spaces and a leading + only'),
      z.literal(''),
    ])
    .optional(),

  footerText: z.string().max(300, 'Footer text is too long').optional().or(z.literal('')),
})

export type SettingsFormValues = z.input<typeof settingsSchema>

export const EMPTY_SETTINGS: SettingsFormValues = {
  heroHeadline: '',
  heroSubtext: '',
  foundedYear: '',
  memberCountOverride: '',
  aboutTitle: '',
  aboutDescription: '',
  instagramUrl: '',
  mapsUrl: '',
  whatsappNumber: '',
  footerText: '',
}

// ---------------------------------------------------------------------------

export const mediaSchema = z.object({
  section: z.enum(['about', 'gallery']),
  caption: z.string().max(200, 'Caption is too long').optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export type MediaFormValues = z.input<typeof mediaSchema>

export const EMPTY_MEDIA: MediaFormValues = {
  section: 'gallery',
  caption: '',
  displayOrder: 0,
  isActive: true,
}

// ---------------------------------------------------------------------------

export const offerSchema = z.object({
  title: z.string().trim().min(2, 'Enter the offer title').max(120, 'Title is too long'),
  valueLabel: z.string().max(40, 'Keep it short — it is the big number').optional().or(z.literal('')),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export type OfferFormValues = z.input<typeof offerSchema>

export const EMPTY_OFFER: OfferFormValues = {
  title: '',
  valueLabel: '',
  description: '',
  displayOrder: 0,
  isActive: true,
}

// ---------------------------------------------------------------------------

/**
 * The consent rule, client-side.
 *
 * The server refuses the same combination and the database has a CHECK behind
 * that, so this is the first of three gates rather than the only one. It is
 * here so the editor is told before they upload two photographs, not after.
 */
export const transformationSchema = z
  .object({
    memberId: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
    displayName: z
      .string()
      .trim()
      .min(2, 'Enter the name as it may appear publicly')
      .max(120, 'Name is too long'),
    goal: z.string().max(80, 'Goal is too long').optional().or(z.literal('')),
    achievement: z.string().max(120, 'Achievement is too long').optional().or(z.literal('')),
    durationLabel: z.string().max(60, 'Duration is too long').optional().or(z.literal('')),
    description: z.string().max(1500, 'Description is too long').optional().or(z.literal('')),
    consentGiven: z.boolean().default(false),
    isActive: z.boolean().default(false),
    displayOrder: z.coerce.number().int().min(0).default(0),
  })
  .refine((v) => !v.isActive || v.consentGiven, {
    message: "Record the member's consent before publishing this story.",
    path: ['consentGiven'],
  })

export type TransformationFormValues = z.input<typeof transformationSchema>

export const EMPTY_TRANSFORMATION: TransformationFormValues = {
  memberId: '',
  displayName: '',
  goal: '',
  achievement: '',
  durationLabel: '',
  description: '',
  consentGiven: false,
  isActive: false,
  displayOrder: 0,
}

// ---------------------------------------------------------------------------

export const eventSchema = z
  .object({
    title: z.string().trim().min(2, 'Enter the event name').max(160, 'Name is too long'),
    eventDate: z.string().min(1, 'Pick a date'),
    startTime: z.string().optional().or(z.literal('')),
    endTime: z.string().optional().or(z.literal('')),
    location: z.string().max(160, 'Location is too long').optional().or(z.literal('')),
    description: z.string().max(1500, 'Description is too long').optional().or(z.literal('')),
    isActive: z.boolean().default(true),
    displayOrder: z.coerce.number().int().min(0).default(0),
  })
  .refine((v) => !v.endTime || !!v.startTime, {
    message: 'Set a start time before an end time.',
    path: ['startTime'],
  })
  .refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, {
    message: 'The end time must be after the start time.',
    path: ['endTime'],
  })

export type EventFormValues = z.input<typeof eventSchema>

export const EMPTY_EVENT: EventFormValues = {
  title: '',
  eventDate: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  isActive: true,
  displayOrder: 0,
}
