import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth'
import { canMarkAttendance } from '@/utils/permissions'
import { todayKey } from '@/utils/date'
import { useMarkAttendance } from '@/features/attendance/hooks/use-attendance'
import { keys as dashboardKeys } from '@/features/dashboard/hooks/use-dashboard'
import type { DashboardAttendance } from '@/features/dashboard/types/dashboard'

/**
 * Today's register, and the fastest way to close it.
 *
 * Staff only. `member_checkins` exists in the schema but nothing writes to it
 * until a check-in module is built, so a "142 Members" figure here would be a
 * permanent zero pretending to be data — the design's member tile is left out
 * rather than faked.
 *
 * Marking reuses the attendance module's own mutation, which already invalidates
 * that module's cache and raises the toast. The only thing added here is a
 * second invalidation for the dashboard's own key, passed per call so the shared
 * hook keeps knowing nothing about this screen.
 */
export function AttendanceSnapshotCard({ attendance }: { attendance: DashboardAttendance }) {
  const role = useAuthStore((s) => s.user?.role)
  const queryClient = useQueryClient()
  const mark = useMarkAttendance()

  const canMark = canMarkAttendance(role)

  const markPresent = (staffId: number) =>
    mark.mutate(
      { staffId, date: todayKey(), status: 'present' },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all }) },
    )

  return (
    <section className="card-surface flex flex-1 flex-col border border-surface-container-high/50 p-md">
      <h2 className="mb-md text-headline-md text-on-surface">Today's Attendance</h2>

      <div className="mb-md rounded-md bg-surface-container-low p-md text-center">
        <div className="text-headline-lg font-bold text-on-background">
          {attendance.present}
          <span className="text-body-md text-on-surface-variant">/{attendance.totalStaff}</span>
        </div>
        <div className="font-mono text-label-sm text-on-surface-variant">Staff present</div>
      </div>

      <h3 className="mb-sm font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
        Not marked today
      </h3>

      {attendance.notMarkedStaff.length === 0 ? (
        <p className="py-md text-body-md text-on-surface-variant">
          {attendance.totalStaff === 0
            ? 'No staff on the roster yet.'
            : 'Everyone on today’s roster has been marked.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-xs">
          {attendance.notMarkedStaff.map((person) => (
            <li
              key={person.staffId}
              className="flex items-center justify-between gap-sm rounded-md p-2 transition-colors hover:bg-surface-container-low"
            >
              <Link
                to={ROUTES.attendanceDetails(person.staffId)}
                className="flex min-w-0 items-center gap-sm"
              >
                <Avatar name={person.fullName} src={person.photoUrl} className="h-8 w-8 text-label-sm" />
                <span className="min-w-0">
                  <span className="block truncate text-body-md text-on-surface">{person.fullName}</span>
                  <span className="block font-mono text-label-sm capitalize text-on-surface-variant">
                    {person.role}
                  </span>
                </span>
              </Link>

              {/* Hidden for a trainer, who cannot take the register. A courtesy
                  only — the MarkAttendance policy is what actually stops them. */}
              {canMark && (
                <button
                  type="button"
                  onClick={() => markPresent(person.staffId)}
                  disabled={mark.isPending}
                  className="shrink-0 font-mono text-label-md font-bold text-primary-container hover:underline disabled:opacity-40"
                >
                  {mark.isPending ? <Spinner size="sm" /> : 'Mark'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Link
        to={ROUTES.ATTENDANCE}
        className="mt-md flex items-center justify-center gap-xs rounded-md border-[1.5px] border-outline px-md py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <ClipboardCheck className="h-4 w-4" aria-hidden /> Manage Attendance
      </Link>
    </section>
  )
}
