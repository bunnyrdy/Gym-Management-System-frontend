import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth'
import { canCorrectAttendance, canMarkAttendance } from '@/utils/permissions'
import { todayKey } from '@/utils/date'
import type { AttendanceRosterItem, StoredStatus } from '@/features/attendance/types/attendance'

/**
 * Mark Present / Mark Absent / View Details for one roster row.
 *
 * Which buttons appear is driven by what the row already says, matching the
 * mockup: a present row offers only "Mark Absent", an absent row only "Mark
 * Present", an unmarked row offers both. Offering the state something is
 * already in would be a no-op that answers 409.
 *
 * Hiding a control is a courtesy, not a lock — every one of these rules is
 * enforced again by an [Authorize] policy on the server.
 */
export function RosterRowActions({
  row,
  date,
  onMark,
  onCorrect,
  busy,
}: {
  row: AttendanceRosterItem
  date: string
  onMark: (staffId: number, status: StoredStatus) => void
  onCorrect: (row: AttendanceRosterItem, status: StoredStatus) => void
  busy: boolean
}) {
  const role = useAuthStore((s) => s.user?.role)
  const isPast = date < todayKey()

  // Marking is only ever for today. A past day needs the correction path, which
  // is managerial, and a week off has nothing to record against.
  const canWrite =
    row.status !== 'week_off' &&
    (isPast ? canCorrectAttendance(role) : canMarkAttendance(role))

  const act = (status: StoredStatus) =>
    row.attendanceId === null ? onMark(row.staffId, status) : onCorrect(row, status)

  return (
    <div className="flex items-center justify-end gap-2">
      {canWrite && row.status !== 'present' && (
        <button
          type="button"
          onClick={() => act('present')}
          disabled={busy}
          className="rounded-md bg-primary-container px-3 py-1.5 font-mono text-label-sm font-bold text-on-primary transition-colors hover:bg-primary disabled:opacity-50"
        >
          Mark Present
        </button>
      )}

      {canWrite && row.status !== 'absent' && (
        <button
          type="button"
          onClick={() => act('absent')}
          disabled={busy}
          className="rounded-md px-3 py-1.5 font-mono text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-50"
        >
          Mark Absent
        </button>
      )}

      <Link
        to={ROUTES.attendanceDetails(row.staffId)}
        className="rounded-md border border-secondary-container px-3 py-1.5 font-mono text-label-sm text-on-surface transition-colors hover:bg-surface-container-low"
        aria-label={`Open ${row.fullName}'s attendance`}
      >
        View Details
      </Link>
    </div>
  )
}
