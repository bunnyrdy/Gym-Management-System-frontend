import { z } from 'zod'

/**
 * Mirrors the server's StaffWriteRequest validation, shared by both roles.
 *
 * This is a UX layer, not a security boundary — the API validates everything
 * again, because anything running in the browser is under the caller's control.
 * Keeping the two in step just means users see errors inline instead of after a
 * round trip.
 */
  const phone = z
  .string()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits');

const optionalPhone = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .optional()
);


const today = () => new Date().toISOString().slice(0, 10)

export const staffSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter the full name').max(120, 'Name is too long'),
    gender: z.enum(['male', 'female', 'other', 'undisclosed']).optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
    phone,
    email: z.union([z.email('Enter a valid email'), z.literal('')]).optional(),
    address: z.string().max(300, 'Address is too long').optional().or(z.literal('')),
    emergencyContactName: z.string().max(120).optional().or(z.literal('')),
    emergencyContactPhone: optionalPhone,

    jobTitle: z.string().max(80).optional().or(z.literal('')),
    specialization: z.string().max(80).optional().or(z.literal('')),
    // The form takes a comma-separated string; it is split on submit.
    qualifications: z.string().max(600, 'Too many qualifications').optional().or(z.literal('')),
    experienceYears: z
      .union([z.coerce.number().min(0, 'Cannot be negative').max(60, 'That looks too high'), z.literal('')])
      .optional(),
    joiningDate: z.string().min(1, 'Joining date is required'),
    status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
    notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),

    shiftId: z.union([z.coerce.number(), z.literal('')]).optional(),
    customStartTime: z.string().optional().or(z.literal('')),
    customEndTime: z.string().optional().or(z.literal('')),
    workingDays: z.array(z.number().min(1).max(7)).default([]),
    responsibilityTagIds: z.array(z.number()).default([]),
  })
  .superRefine((v, ctx) => {
    const err = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (v.dateOfBirth) {
      const dob = new Date(v.dateOfBirth)
      const sixteen = new Date()
      sixteen.setFullYear(sixteen.getFullYear() - 16)
      if (v.dateOfBirth >= today()) err('dateOfBirth', 'Date of birth must be in the past')
      else if (dob > sixteen) err('dateOfBirth', 'Staff must be at least 16 years old')
    }

    if (v.shiftId && v.workingDays.length === 0)
      err('workingDays', 'Select at least one working day')
    if (!v.shiftId && v.workingDays.length > 0) err('shiftId', 'Select a shift')

    if (!!v.customStartTime !== !!v.customEndTime)
      err('customEndTime', 'Provide both times, or neither')
    if (v.customStartTime && v.customEndTime && v.customEndTime <= v.customStartTime)
      err('customEndTime', 'End time must be after start time')
  })

export type StaffFormValues = z.input<typeof staffSchema>

export const EMPTY_STAFF: StaffFormValues = {
  fullName: '', gender: '', dateOfBirth: '', phone: '', email: '', address: '',
  emergencyContactName: '', emergencyContactPhone: '',
  jobTitle: '', specialization: '', qualifications: '', experienceYears: '',
  joiningDate: new Date().toISOString().slice(0, 10),
  status: 'active', notes: '',
  shiftId: '', customStartTime: '', customEndTime: '', workingDays: [], responsibilityTagIds: [],
}
