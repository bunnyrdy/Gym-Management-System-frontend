import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, formatDayLabel, todayKey } from '@/utils/date'

/**
 * The `‹ Today, 24 Aug ›` control above the roster.
 *
 * Stepping forward past today is disabled rather than hidden. Attendance cannot
 * be marked for a day that has not happened, so a Next button that silently did
 * nothing would be worse than one that visibly cannot be pressed.
 */
export function DateNavigator({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const today = todayKey()
  const atToday = value >= today

  return (
    <div className="flex items-center gap-1 rounded-md border border-surface-container-high bg-surface-container-lowest p-1 shadow-soft-lift">
      <button
        type="button"
        onClick={() => onChange(addDays(value, -1))}
        aria-label="Previous day"
        className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <label className="flex cursor-pointer items-center gap-sm px-sm">
        <CalendarDays className="h-4 w-4 text-primary-container" aria-hidden />
        <span className="font-mono text-label-md font-bold text-on-surface">
          {formatDayLabel(value)}
        </span>
        {/* The visible label is the control; the input is the picker behind it,
            so the whole thing stays keyboard- and screen-reader-reachable
            without building a calendar popover of our own. */}
        <input
          type="date"
          value={value}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          aria-label="Pick a date"
          className="w-0 opacity-0"
        />
      </label>

      <button
        type="button"
        onClick={() => onChange(addDays(value, 1))}
        disabled={atToday}
        aria-label="Next day"
        className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
