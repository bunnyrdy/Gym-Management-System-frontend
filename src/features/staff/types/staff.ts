export type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'
export type Gender = 'male' | 'female' | 'other' | 'undisclosed'

/** Which API resource a screen is bound to. Receptionists and trainers share every shape. */
export type StaffRole = 'receptionists' | 'trainers'

export interface ShiftOption {
  id: number
  name: string
  startTime: string | null
  endTime: string | null
}

export interface TagOption {
  id: number
  name: string
}

export interface ShiftAssignment {
  shiftId: number
  shiftName: string
  startTime: string | null
  endTime: string | null
  workingDays: number[]
}

export interface StaffMember {
  id: number
  staffCode: string
  role: string
  fullName: string
  gender: Gender | null
  dateOfBirth: string | null
  phone: string
  email: string | null
  address: string | null
  photoUrl: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  jobTitle: string | null
  specialization: string | null
  qualifications: string[]
  experienceYears: number | null
  joiningDate: string
  status: StaffStatus
  notes: string | null
  ptClientCount: number
  shift: ShiftAssignment | null
  responsibilities: TagOption[]
}

export interface StaffListItem {
  id: number
  staffCode: string
  fullName: string
  gender: Gender | null
  phone: string
  email: string | null
  photoUrl: string | null
  specialization: string | null
  experienceYears: number | null
  status: StaffStatus
  shiftName: string | null
  shiftStart: string | null
  shiftEnd: string | null
  ptClientCount: number
  responsibilities: string[]
}

/** The cards above a staff list, counted over the branch rather than the page. */
export interface StaffStats {
  total: number
  active: number
  inactive: number
  onLeave: number
  withPtClients: number
}

export const STATUS_LABELS: Record<StaffStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  terminated: 'Terminated',
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  undisclosed: 'Prefer not to say',
}

/** ISO weekdays, 1=Mon .. 7=Sun — matches the DB CHECK and the M T W T F S S toggles. */
export const WEEKDAYS = [
  { value: 1, label: 'M', full: 'Monday' },
  { value: 2, label: 'T', full: 'Tuesday' },
  { value: 3, label: 'W', full: 'Wednesday' },
  { value: 4, label: 'T', full: 'Thursday' },
  { value: 5, label: 'F', full: 'Friday' },
  { value: 6, label: 'S', full: 'Saturday' },
  { value: 7, label: 'S', full: 'Sunday' },
] as const

/** Trims a shift time for display: "14:00:00" -> "14:00". */
export const hhmm = (t: string | null | undefined) => t?.slice(0, 5) ?? null
