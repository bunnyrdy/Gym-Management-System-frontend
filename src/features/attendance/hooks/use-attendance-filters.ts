import { useMemo, useState } from 'react'
import { useDebounced } from '@/utils/use-debounced'
import { todayKey } from '@/utils/date'
import type { AttendanceFilters } from '@/features/attendance/services/attendance.service'

export interface AttendanceFilterState {
  search: string
  role: string
  shiftId: string
  status: string
}

const EMPTY: AttendanceFilterState = { search: '', role: '', shiftId: '', status: '' }

/**
 * Day + search + role + shift + status + page, debounced. Same shape as
 * useMemberFilters and useStaffFilters, with the date navigator added.
 *
 * The date starts on the browser's today. The server decides what "today" means
 * at the branch when no date is sent, but the navigator needs a concrete value
 * to step forwards and backwards from, and the two agree except for a viewer in
 * another timezone.
 */
export function useAttendanceFilters(pageSize = 20) {
  const [date, setDate] = useState(todayKey())
  const [filters, setFilters] = useState<AttendanceFilterState>(EMPTY)
  const [page, setPage] = useState(1)
  const search = useDebounced(filters.search, 300)

  const update = (patch: Partial<AttendanceFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1) // a filtered result set has different pages
  }

  const goToDate = (next: string) => {
    setDate(next)
    setPage(1)
  }

  const query = useMemo<AttendanceFilters>(
    () => ({
      date,
      search: search || undefined,
      role: filters.role || undefined,
      shiftId: filters.shiftId ? Number(filters.shiftId) : undefined,
      status: filters.status || undefined,
      page,
      pageSize,
    }),
    [date, search, filters.role, filters.shiftId, filters.status, page, pageSize],
  )

  // The cards are counted over the whole day for the chosen role, so they
  // deliberately ignore search, shift and status — a card that moved when you
  // typed would be describing the page, not the day.
  const statsQuery = useMemo(
    () => ({ date, role: filters.role || undefined }),
    [date, filters.role],
  )

  return {
    date,
    goToDate,
    filters,
    update,
    page,
    setPage,
    query,
    statsQuery,
    isFiltered: Boolean(filters.search || filters.role || filters.shiftId || filters.status),
  }
}
