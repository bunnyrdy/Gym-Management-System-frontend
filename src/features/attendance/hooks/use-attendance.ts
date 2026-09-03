import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'
import {
  attendanceLookupService,
  attendanceService,
  type AttendanceFilters,
  type AttendanceLogFilters,
  type CorrectAttendancePayload,
  type MarkAttendancePayload,
} from '@/features/attendance/services/attendance.service'

export const keys = {
  all: ['attendance'] as const,
  roster: (f: AttendanceFilters) => ['attendance', 'roster', f] as const,
  stats: (p: { date?: string; role?: string }) => ['attendance', 'stats', p] as const,
  detail: (id: number, month?: string) => ['attendance', 'detail', id, month] as const,
  log: (id: number, f: AttendanceLogFilters) => ['attendance', 'log', id, f] as const,
  shifts: ['attendance', 'shifts'] as const,
}

function message(err: unknown, fallback: string): string {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback
}

export function useAttendanceRoster(filters: AttendanceFilters) {
  return useQuery({
    queryKey: keys.roster(filters),
    queryFn: () => attendanceService.roster(filters).then((r) => r.data),
    // Keeps the table on screen while a new day or filter loads, instead of
    // collapsing to a spinner on every keystroke.
    placeholderData: (prev) => prev,
  })
}

export function useAttendanceStats(params: { date?: string; role?: string }) {
  return useQuery({
    queryKey: keys.stats(params),
    queryFn: () => attendanceService.stats(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useAttendanceDetail(staffId: number | undefined, month?: string) {
  return useQuery({
    queryKey: keys.detail(staffId!, month),
    queryFn: () => attendanceService.detail(staffId!, month).then((r) => r.data),
    enabled: staffId !== undefined && !Number.isNaN(staffId),
    placeholderData: (prev) => prev,
  })
}

export function useAttendanceLog(staffId: number | undefined, filters: AttendanceLogFilters) {
  return useQuery({
    queryKey: keys.log(staffId!, filters),
    queryFn: () => attendanceService.log(staffId!, filters).then((r) => r.data),
    enabled: staffId !== undefined && !Number.isNaN(staffId),
    placeholderData: (prev) => prev,
  })
}

export function useShiftOptions() {
  return useQuery({
    queryKey: keys.shifts,
    queryFn: () => attendanceLookupService.shifts().then((r) => r.data),
    staleTime: Infinity,
  })
}

/**
 * Both writes invalidate the whole module rather than patching one row: the
 * summary cards, the calendar and the monthly percentage all move when a single
 * mark changes, and re-reading is cheaper than keeping four caches in step.
 *
 * Neither navigates. The user marked someone from a table and should still be
 * looking at that table, with the row updated underneath them.
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) =>
      attendanceService.mark(payload).then((r) => r.data),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: keys.all })
      toast.success(record.status === 'present' ? 'Marked present' : 'Marked absent')
    },
    onError: (err) => toast.error(message(err, 'Could not save attendance. Please try again.')),
  })
}

export function useCorrectAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: CorrectAttendancePayload & { id: number }) =>
      attendanceService.correct(id, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all })
      toast.success('Attendance updated')
    },
    onError: (err) => toast.error(message(err, 'Could not update attendance. Please try again.')),
  })
}
