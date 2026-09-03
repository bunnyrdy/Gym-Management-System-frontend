import { Spinner } from '@/components/ui/spinner'
import { formatDate, formatTime, formatWeekday } from '@/utils/date'
import { AttendanceStatusChip } from '@/features/attendance/components/attendance-status-chip'
import type { AttendanceLogItem } from '@/features/attendance/types/attendance'

const HEADERS = ['Date & Day', 'Shift', 'Check-in', 'Check-out', 'Status', '']

export type LogRange = 'today' | 'month' | 'all'

const RANGE_LABELS: Record<LogRange, string> = {
  today: 'Today',
  month: 'This Month',
  all: 'All Time',
}

/**
 * The Attendance Log beneath the calendar.
 *
 * Its own table rather than the shared TableCard: the design gives this card a
 * range toggle in the header and a "Load More" footer instead of Prev/Next
 * pagination, so almost nothing of TableCard's chrome would be used.
 */
export function AttendanceLogCard({
  items,
  range,
  onRangeChange,
  onLoadMore,
  hasMore,
  isLoading,
  canCorrect,
  onCorrect,
}: {
  items: AttendanceLogItem[]
  range: LogRange
  onRangeChange: (next: LogRange) => void
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  canCorrect: boolean
  onCorrect: (item: AttendanceLogItem) => void
}) {
  return (
    <section className="card-surface overflow-hidden" aria-label="Attendance log">
      <header className="flex flex-wrap items-center justify-between gap-sm px-md py-md">
        <h2 className="text-body-lg font-semibold text-on-surface">Attendance Log</h2>

        <div
          role="group"
          aria-label="Log range"
          className="flex rounded-md border border-surface-container-high p-1"
        >
          {(Object.keys(RANGE_LABELS) as LogRange[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onRangeChange(key)}
              aria-pressed={range === key}
              className={
                range === key
                  ? 'rounded-md bg-surface-container-high px-3 py-1 font-mono text-label-sm font-bold text-on-surface'
                  : 'rounded-md px-3 py-1 font-mono text-label-sm text-on-surface-variant transition-colors hover:text-on-surface'
              }
            >
              {RANGE_LABELS[key]}
            </button>
          ))}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-container-high bg-surface-bright">
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-md py-sm font-mono text-label-sm font-medium uppercase tracking-wider text-on-surface-variant"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container-high">
            {isLoading && items.length === 0 && (
              <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center"><Spinner className="mx-auto text-primary-container" /></td></tr>
            )}

            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
                  Nothing recorded for this range.
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-surface-container-low">
                <td className="whitespace-nowrap px-md py-sm">
                  <div className="text-body-md font-semibold text-on-surface">{formatDate(item.date)}</div>
                  <div className="font-mono text-label-sm text-on-surface-variant">
                    {formatWeekday(item.date)}
                  </div>
                </td>

                <td className="px-md py-sm text-body-md text-on-surface">{item.shiftName ?? '—'}</td>

                <td className="whitespace-nowrap px-md py-sm font-mono text-label-md text-on-surface">
                  {formatTime(item.checkInAt)}
                  {item.isLate && <span className="ml-2 text-error">(Late)</span>}
                </td>

                <td className="whitespace-nowrap px-md py-sm font-mono text-label-md text-on-surface">
                  {formatTime(item.checkOutAt)}
                </td>

                <td className="px-md py-sm">
                  <AttendanceStatusChip status={item.status} />
                  {item.markedVia === 'system' && (
                    <div className="mt-1 font-mono text-label-sm text-on-surface-variant">
                      Auto-closed
                    </div>
                  )}
                </td>

                <td className="px-md py-sm">
                  <div className="flex justify-end">
                    {canCorrect && (
                      <button
                        type="button"
                        onClick={() => onCorrect(item)}
                        className="font-mono text-label-md text-primary-container transition-colors hover:text-primary"
                        aria-label={`Edit attendance for ${formatDate(item.date)}`}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-surface-container-high px-md py-sm text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="font-mono text-label-md font-bold text-primary-container transition-colors hover:text-primary disabled:opacity-50"
          >
            {isLoading ? 'Loading…' : 'Load More Records'}
          </button>
        </div>
      )}
    </section>
  )
}
