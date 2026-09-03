/**
 * The attendance module's vocabulary.
 *
 * Only two of these four statuses exist in the database. `not_marked` is the
 * absence of a record, and `week_off` is a day outside the person's roster or
 * before they were hired; both are derived server-side. The client never sends
 * either — see StoredStatus.
 */
export type AttendanceStatus = 'present' | 'absent' | 'not_marked' | 'week_off'

/** What a mark or a correction is allowed to write. */
export type StoredStatus = Extract<AttendanceStatus, 'present' | 'absent'>

export type StaffRoleName = 'trainer' | 'receptionist' | 'manager' | 'admin'

export const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  not_marked: 'Not Marked',
  week_off: 'Week Off',
}

export const ROLE_LABELS: Record<StaffRoleName, string> = {
  trainer: 'Trainer',
  receptionist: 'Receptionist',
  manager: 'Manager',
  admin: 'Admin',
}

/** ISO weekday order, 1 = Mon … 7 = Sun, matching `working_days` on the server. */
export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export interface AttendanceRosterItem {
  staffId: number
  staffCode: string
  fullName: string
  photoUrl: string | null
  role: StaffRoleName
  jobTitle: string | null
  shiftName: string | null
  shiftStart: string | null
  shiftEnd: string | null
  status: AttendanceStatus
  /** Null until something has been recorded — also what gates the Edit control. */
  attendanceId: number | null
  checkInAt: string | null
  checkOutAt: string | null
  isLate: boolean
  /** 'system' means nobody marked it; the end-of-day sweep closed the day out. */
  markedVia: string | null
  notes: string | null
}

export interface AttendanceStats {
  totalStaff: number
  present: number
  absent: number
  notMarked: number
}

export interface AttendanceDay {
  date: string
  status: AttendanceStatus
  isLate: boolean
  checkInAt: string | null
}

export interface AttendanceSummary {
  workingDays: number
  daysPresent: number
  daysAbsent: number
  /** Null when the month has no working days yet — the server guards the divide. */
  attendancePct: number | null
}

export interface AttendanceDetail {
  staffId: number
  staffCode: string
  fullName: string
  photoUrl: string | null
  role: StaffRoleName
  jobTitle: string | null
  joiningDate: string
  staffStatus: string
  shiftName: string | null
  shiftStart: string | null
  shiftEnd: string | null
  workingDays: number[]
  month: string
  /** Today in the branch's calendar. Trust this over the browser's clock. */
  today: string
  todayStatus: AttendanceStatus
  todayAttendanceId: number | null
  summary: AttendanceSummary
  days: AttendanceDay[]
}

export interface AttendanceLogItem {
  id: number
  date: string
  shiftName: string | null
  checkInAt: string | null
  checkOutAt: string | null
  status: AttendanceStatus
  isLate: boolean
  markedVia: string
  notes: string | null
}

export interface AttendanceRecord {
  id: number
  staffId: number
  date: string
  status: StoredStatus
  isLate: boolean
  checkInAt: string | null
  checkOutAt: string | null
  markedVia: string
  notes: string | null
}

/** Attendance percentage as a whole-number string, or an em dash when unknown. */
export function formatPct(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${value}%`
}
