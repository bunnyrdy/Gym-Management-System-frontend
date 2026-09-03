import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type {
  AttendanceDetail,
  AttendanceLogItem,
  AttendanceRecord,
  AttendanceRosterItem,
  AttendanceStats,
  StoredStatus,
} from '@/features/attendance/types/attendance'

const BASE = '/attendance'

export interface AttendanceFilters {
  /** `YYYY-MM-DD`. Omitted means today at the branch, which the server decides. */
  date?: string
  search?: string
  role?: string
  shiftId?: number
  status?: string
  page?: number
  pageSize?: number
}

export interface AttendanceLogFilters {
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface MarkAttendancePayload {
  staffId: number
  date: string
  status: StoredStatus
  notes?: string
}

export interface CorrectAttendancePayload {
  status: StoredStatus
  notes?: string
}

export const attendanceService = {
  roster: (filters: AttendanceFilters) =>
    api.get<PagedResult<AttendanceRosterItem>>(BASE, { params: filters }),

  stats: (params: { date?: string; role?: string }) =>
    api.get<AttendanceStats>(`${BASE}/stats`, { params }),

  detail: (staffId: number, month?: string) =>
    api.get<AttendanceDetail>(`${BASE}/staff/${staffId}`, { params: { month } }),

  log: (staffId: number, filters: AttendanceLogFilters) =>
    api.get<PagedResult<AttendanceLogItem>>(`${BASE}/staff/${staffId}/log`, { params: filters }),

  /** Records a mark where there is none. 409 if the day is already recorded. */
  mark: (payload: MarkAttendancePayload) =>
    api.post<AttendanceRecord>(`${BASE}/mark`, payload),

  /** Rewrites an existing record. Managerial only — the server enforces it. */
  correct: (id: number, payload: CorrectAttendancePayload) =>
    api.put<AttendanceRecord>(`${BASE}/${id}`, payload),
}

export const attendanceLookupService = {
  /** Reuses the staff forms' shift dropdown — the roster filters on the same list. */
  shifts: () =>
    api.get<{ id: number; name: string; startTime: string | null; endTime: string | null }[]>(
      '/lookups/shifts',
    ),
}
