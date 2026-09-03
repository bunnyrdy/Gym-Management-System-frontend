import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { addMonths, formatMonth, leadingBlanks, parseDate, startOfMonth, todayKey } from '@/utils/date'
import {
  STATUS_LABELS,
  WEEKDAY_INITIALS,
  type AttendanceDay,
  type AttendanceStatus,
} from '@/features/attendance/types/attendance'

/**
 * The Monthly Calendar View.
 *
 * Built by hand because there is no calendar component and no date library in
 * this project, and a month grid is a week of blanks plus N cells.
 *
 * Monday-first, not Sunday-first: the roster's `workingDays` is ISO
 * (1 = Mon … 7 = Sun) and the M T W T F S S header in the design matches that.
 * A Sunday-first grid would put every week off in the wrong column.
 */
const cellTones: Record<AttendanceStatus, string> = {
  present: 'bg-status-active/10 text-status-active',
  absent: 'bg-error/10 text-error',
  not_marked: 'bg-surface-container-low text-on-surface-variant',
  week_off: 'bg-surface-container text-on-surface-variant/60',
}

export function MonthCalendar({
  month,
  days,
  onMonthChange,
}: {
  month: string
  days: AttendanceDay[]
  onMonthChange: (next: string) => void
}) {
  const today = todayKey()
  const blanks = leadingBlanks(month)
  // Never let the user page into a month that has not started.
  const atCurrentMonth = startOfMonth(month) >= startOfMonth(today)

  return (
    <section className="card-surface p-md" aria-label="Monthly calendar">
      <header className="mb-md flex flex-wrap items-center justify-between gap-sm">
        <h2 className="text-body-lg font-semibold text-on-surface">Monthly Calendar View</h2>

        <div className="flex items-center gap-md">
          <Legend />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(month, -1))}
              aria-label="Previous month"
              className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="min-w-[9rem] text-center font-mono text-label-md font-bold text-on-surface">
              {formatMonth(month)}
            </span>
            <button
              type="button"
              onClick={() => onMonthChange(addMonths(month, 1))}
              disabled={atCurrentMonth}
              aria-label="Next month"
              className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <div
            key={i}
            className="pb-1 text-center font-mono text-label-sm uppercase tracking-wider text-on-surface-variant"
            /* M and T repeat, so the initial alone is not a label. */
            aria-hidden
          >
            {initial}
          </div>
        ))}

        {Array.from({ length: blanks }, (_, i) => (
          <div key={`blank-${i}`} aria-hidden />
        ))}

        {days.map((day) => {
          const dayOfMonth = parseDate(day.date).getDate()
          const isToday = day.date === today

          return (
            <div
              key={day.date}
              title={`${day.date} — ${STATUS_LABELS[day.status]}${day.isLate ? ' (Late)' : ''}`}
              className={cn(
                // Square at narrow widths, capped at wide ones: an unbounded
                // aspect-square cell grows with the column and turns a month
                // into several screens of scrolling.
                'relative flex aspect-square max-h-20 items-center justify-center rounded-md font-mono text-label-md font-bold',
                cellTones[day.status],
                isToday && 'ring-2 ring-primary-container ring-offset-1 ring-offset-surface',
              )}
            >
              <span className="sr-only">
                {day.date}, {STATUS_LABELS[day.status]}
                {day.isLate ? ', late' : ''}
              </span>
              <span aria-hidden>{dayOfMonth}</span>
              {day.isLate && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-error"
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Legend() {
  return (
    <div className="flex items-center gap-sm font-mono text-label-sm text-on-surface-variant">
      <Dot className="bg-status-active" label={STATUS_LABELS.present} />
      <Dot className="bg-error" label={STATUS_LABELS.absent} />
      <Dot className="bg-on-surface-variant/40" label={STATUS_LABELS.week_off} />
    </div>
  )
}

function Dot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn('h-2 w-2 rounded-full', className)} aria-hidden />
      {label}
    </span>
  )
}
