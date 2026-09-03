import { useState } from 'react'
import { CheckCircle2, HelpCircle, IdCard, XCircle } from 'lucide-react'
import { SummaryCard, TableCard } from '@/components/ui/list-shell'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { formatShiftWindow } from '@/utils/date'
import {
  useAttendanceRoster,
  useAttendanceStats,
  useCorrectAttendance,
  useMarkAttendance,
  useShiftOptions,
} from '@/features/attendance/hooks/use-attendance'
import { useAttendanceFilters } from '@/features/attendance/hooks/use-attendance-filters'
import { AttendanceFilterBar } from '@/features/attendance/components/attendance-filter-bar'
import { AttendanceStatusChip } from '@/features/attendance/components/attendance-status-chip'
import { DateNavigator } from '@/features/attendance/components/date-navigator'
import { RosterRowActions } from '@/features/attendance/components/roster-row-actions'
import {
  ROLE_LABELS,
  STATUS_LABELS,
  type AttendanceRosterItem,
  type StoredStatus,
} from '@/features/attendance/types/attendance'

const HEADERS = ['Staff Member', 'Role', 'Shift Timing', 'Status', 'Actions']

/** A pending correction, held while the user confirms it. */
interface Pending {
  row: AttendanceRosterItem
  status: StoredStatus
}

export default function AttendanceListPage() {
  const f = useAttendanceFilters()
  const { data, isLoading, isError } = useAttendanceRoster(f.query)
  const stats = useAttendanceStats(f.statsQuery)
  const shifts = useShiftOptions()

  const mark = useMarkAttendance()
  const correct = useCorrectAttendance()
  const [pending, setPending] = useState<Pending | null>(null)

  const rows = data?.items ?? []
  const busy = mark.isPending || correct.isPending

  /**
   * Marking a fresh day is one click. Changing a day that already has a record
   * asks first — it rewrites what the employment log claims about someone, and
   * the most likely way to get here is a misclick on the wrong row.
   */
  const confirmCorrection = () => {
    if (!pending?.row.attendanceId) return
    correct.mutate(
      { id: pending.row.attendanceId, status: pending.status },
      { onSettled: () => setPending(null) },
    )
  }

  return (
    <>
      <div className="mb-xl flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-background">Staff Attendance</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Track and manage daily attendance for all gym staff.
          </p>
        </div>
        <DateNavigator value={f.date} onChange={f.goToDate} />
      </div>

      <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Staff" value={stats.data?.totalStaff ?? 0} icon={IdCard} tone="text-on-surface-variant" />
        <SummaryCard label="Present" value={stats.data?.present ?? 0} icon={CheckCircle2} tone="text-status-active" />
        <SummaryCard label="Absent" value={stats.data?.absent ?? 0} icon={XCircle} tone="text-status-expired" />
        <SummaryCard label="Not Marked" value={stats.data?.notMarked ?? 0} icon={HelpCircle} tone="text-status-pending" />
      </div>

      <h2 className="mb-md text-body-lg font-semibold text-on-surface">Shift Roaster</h2>

      <AttendanceFilterBar {...f.filters} shifts={shifts.data ?? []} onChange={f.update} />

      <TableCard
        headers={HEADERS}
        page={data?.page}
        totalPages={data?.totalPages}
        totalCount={data?.totalCount}
        onPage={f.setPage}
      >
        {isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center"><Spinner className="mx-auto text-primary-container" /></td></tr>
        )}

        {isError && !isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-error">Could not load attendance.</td></tr>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <tr>
            <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
              No staff {f.isFiltered ? 'match these filters' : 'on the roster for this day'}.
            </td>
          </tr>
        )}

        {rows.map((row) => (
          <tr key={row.staffId} className="transition-colors hover:bg-surface-container-low">
            <td className="px-md py-sm">
              <div className="flex items-center gap-sm">
                <Avatar name={row.fullName} src={row.photoUrl} className="h-10 w-10 text-label-md" />
                <div className="min-w-0">
                  <div className="truncate text-body-md font-semibold text-on-surface">{row.fullName}</div>
                  <div className="font-mono text-label-sm text-on-surface-variant">
                    ID: {row.staffCode}
                  </div>
                </div>
              </div>
            </td>

            <td className="px-md py-sm">
              <div className="text-body-md text-on-surface">{ROLE_LABELS[row.role] ?? row.role}</div>
              {row.jobTitle && (
                <div className="font-mono text-label-sm text-on-surface-variant">{row.jobTitle}</div>
              )}
            </td>

            <td className="whitespace-nowrap px-md py-sm font-mono text-label-md text-on-surface">
              {formatShiftWindow(row.shiftStart, row.shiftEnd)}
              {row.shiftName && (
                <div className="text-label-sm text-on-surface-variant">{row.shiftName}</div>
              )}
            </td>

            <td className="px-md py-sm">
              <AttendanceStatusChip
                status={row.status}
                checkInAt={row.checkInAt}
                isLate={row.isLate}
              />
              {row.markedVia === 'system' && (
                <div className="mt-1 font-mono text-label-sm text-on-surface-variant">
                  Auto-closed
                </div>
              )}
            </td>

            <td className="px-md py-sm">
              <RosterRowActions
                row={row}
                date={f.date}
                busy={busy}
                onMark={(staffId, status) => mark.mutate({ staffId, date: f.date, status })}
                onCorrect={(r, status) => setPending({ row: r, status })}
              />
            </td>
          </tr>
        ))}
      </TableCard>

      <ConfirmDialog
        open={pending !== null}
        title="Change this record?"
        body={
          pending
            ? `${pending.row.fullName} is currently marked ${STATUS_LABELS[
                pending.row.status
              ].toLowerCase()} on ${f.date}. Change it to ${STATUS_LABELS[
                pending.status
              ].toLowerCase()}? The change is recorded against your account.`
            : ''
        }
        confirmLabel="Change it"
        loading={correct.isPending}
        onConfirm={confirmCorrection}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
