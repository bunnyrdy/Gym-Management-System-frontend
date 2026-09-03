import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CalendarCheck, CalendarDays, CalendarX, Percent } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/common/alert'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SummaryCard } from '@/components/ui/list-shell'
import { Chip } from '@/components/ui/status-chip'
import { useAuthStore } from '@/store/auth'
import { canCorrectAttendance, canMarkAttendance } from '@/utils/permissions'
import { addMonths, formatDate, formatShiftWindow, startOfMonth } from '@/utils/date'
import {
  useAttendanceDetail,
  useAttendanceLog,
  useCorrectAttendance,
  useMarkAttendance,
} from '@/features/attendance/hooks/use-attendance'
import { MonthCalendar } from '@/features/attendance/components/month-calendar'
import { AttendanceStatusChip } from '@/features/attendance/components/attendance-status-chip'
import {
  AttendanceLogCard,
  type LogRange,
} from '@/features/attendance/components/attendance-log-card'
import {
  ROLE_LABELS,
  STATUS_LABELS,
  WEEKDAY_INITIALS,
  formatPct,
  type AttendanceLogItem,
  type StoredStatus,
} from '@/features/attendance/types/attendance'

const PAGE_SIZE = 10

/**
 * Attendance Details — one person's profile, monthly totals, calendar and log.
 *
 * The month being browsed is local state; the server is asked for that month's
 * grid and summary. "Today" comes from the response rather than the browser, so
 * a laptop in another timezone still agrees with the gym about what day it is.
 */
export default function AttendanceDetailsPage() {
  const { staffId } = useParams<{ staffId: string }>()
  const id = staffId ? Number(staffId) : undefined

  const [month, setMonth] = useState<string | undefined>(undefined)
  const [range, setRange] = useState<LogRange>('month')
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [pending, setPending] = useState<{ item: AttendanceLogItem; status: StoredStatus } | null>(null)

  const role = useAuthStore((s) => s.user?.role)
  const canCorrect = canCorrectAttendance(role)

  const { data, isLoading, isError } = useAttendanceDetail(id, month)
  const mark = useMarkAttendance()
  const correct = useCorrectAttendance()

  const logFilters = useMemo(() => {
    if (!data) return { page: 1, pageSize }
    if (range === 'today') return { from: data.today, to: data.today, page: 1, pageSize }
    if (range === 'month') {
      const start = data.month
      return { from: start, to: addMonths(start, 1), page: 1, pageSize }
    }
    return { page: 1, pageSize }
  }, [data, range, pageSize])

  const log = useAttendanceLog(id, logFilters)

  if (isLoading && !data) {
    return (
      <div className="flex justify-center py-xl">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  if (isError || !data) {
    return <Alert variant="error">Could not load this attendance record.</Alert>
  }

  const canMarkToday =
    canMarkAttendance(role) && data.todayStatus === 'not_marked' && data.todayAttendanceId === null

  const logItems = log.data?.items ?? []
  const hasMore = (log.data?.totalCount ?? 0) > logItems.length

  return (
    <>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-background">
            {ROLE_LABELS[data.role] ?? data.role} Attendance
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            View attendance history and records.
          </p>
        </div>

        {canMarkToday && (
          <button
            type="button"
            disabled={mark.isPending}
            onClick={() => mark.mutate({ staffId: data.staffId, date: data.today, status: 'present' })}
            className="flex items-center gap-xs rounded-md bg-primary-container px-md py-2 font-mono text-label-md font-bold text-on-primary transition-colors hover:bg-primary disabled:opacity-50"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden /> Mark Attended Today
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-lg lg:grid-cols-12">
        {/* Profile rail */}
        <aside className="lg:col-span-4">
          <div className="card-surface overflow-hidden">
            <div className="h-1 w-full bg-primary-container" aria-hidden />

            <div className="p-md">
              <div className="mb-md flex items-center gap-sm">
                <Avatar name={data.fullName} src={data.photoUrl} className="h-16 w-16 text-headline-md" />
                <div className="min-w-0">
                  <div className="truncate text-headline-md text-on-surface">{data.fullName}</div>
                  <div className="font-mono text-label-md text-on-surface-variant">
                    {data.jobTitle ?? ROLE_LABELS[data.role] ?? data.role}
                  </div>
                </div>
              </div>

              <div className="mb-md flex items-center justify-between rounded-md bg-surface-container-low px-sm py-sm">
                <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Status Today
                </span>
                <AttendanceStatusChip status={data.todayStatus} />
              </div>

              <dl className="divide-y divide-surface-container-high">
                <Fact label="Employee ID" value={data.staffCode} />
                <Fact
                  label="Current Shift"
                  value={
                    data.shiftName
                      ? `${data.shiftName} (${formatShiftWindow(data.shiftStart, data.shiftEnd)})`
                      : 'Not rostered'
                  }
                />
                <Fact label="Joined Date" value={formatDate(data.joiningDate)} />
              </dl>

              <div className="mt-md">
                <div className="mb-2 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Working Days
                </div>
                <div className="flex gap-1">
                  {WEEKDAY_INITIALS.map((initial, i) => {
                    const iso = i + 1
                    const on = data.workingDays.includes(iso)
                    return (
                      <span
                        key={i}
                        title={on ? 'Working day' : 'Off'}
                        className={
                          on
                            ? 'flex h-8 w-8 items-center justify-center rounded-full bg-primary-container font-mono text-label-sm font-bold text-on-primary'
                            : 'flex h-8 w-8 items-center justify-center rounded-full bg-surface-container font-mono text-label-sm text-on-surface-variant'
                        }
                      >
                        {initial}
                      </span>
                    )
                  })}
                </div>
              </div>

              {data.staffStatus !== 'active' && (
                <div className="mt-md">
                  <Chip tone="inactive" label={`Staff status: ${data.staffStatus}`} />
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Cards + calendar */}
        <div className="flex min-w-0 flex-col gap-lg lg:col-span-8">
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Working Days" value={data.summary.workingDays} icon={CalendarDays} tone="text-on-surface-variant" />
            <SummaryCard label="Days Present" value={data.summary.daysPresent} icon={CalendarCheck} tone="text-status-active" />
            <SummaryCard label="Days Absent" value={data.summary.daysAbsent} icon={CalendarX} tone="text-status-expired" />

            {/* A percentage is not a count, so it cannot use SummaryCard —
                that component renders a bare number. */}
            <div className="card-surface border border-surface-container-high/50 p-md">
              <div className="mb-4 flex items-start justify-between">
                <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Attendance %
                </span>
                <Percent className="h-5 w-5 text-primary-container" aria-hidden />
              </div>
              <div className="text-headline-lg font-bold text-on-background">
                {formatPct(data.summary.attendancePct)}
              </div>
              <div
                className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high"
                role="progressbar"
                aria-valuenow={data.summary.attendancePct ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Attendance percentage"
              >
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: `${data.summary.attendancePct ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          <MonthCalendar
            month={data.month}
            days={data.days}
            onMonthChange={(next) => setMonth(startOfMonth(next))}
          />
        </div>
      </div>

      <div className="mt-lg">
        <AttendanceLogCard
          items={logItems}
          range={range}
          onRangeChange={(next) => {
            setRange(next)
            setPageSize(PAGE_SIZE)
          }}
          onLoadMore={() => setPageSize((n) => n + PAGE_SIZE)}
          hasMore={hasMore}
          isLoading={log.isLoading || log.isFetching}
          canCorrect={canCorrect}
          onCorrect={(item) =>
            setPending({ item, status: item.status === 'present' ? 'absent' : 'present' })
          }
        />
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Change this record?"
        body={
          pending
            ? `${data.fullName} is marked ${STATUS_LABELS[pending.item.status].toLowerCase()} on ${formatDate(
                pending.item.date,
              )}. Change it to ${STATUS_LABELS[pending.status].toLowerCase()}? The change is recorded against your account.`
            : ''
        }
        confirmLabel="Change it"
        loading={correct.isPending}
        onConfirm={() => {
          if (!pending) return
          correct.mutate(
            { id: pending.item.id, status: pending.status },
            { onSettled: () => setPending(null) },
          )
        }}
        onCancel={() => setPending(null)}
      />
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-sm py-sm">
      <dt className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </dt>
      <dd className="truncate text-body-md font-semibold text-on-surface">{value}</dd>
    </div>
  )
}
