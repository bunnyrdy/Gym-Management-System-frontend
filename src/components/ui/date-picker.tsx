import { CalendarDays } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * A single date, picked from the browser's own calendar.
 *
 * A visible native `<input type="date">` rather than the hidden-input-behind-a-
 * label trick used elsewhere. That trick is right when the visible face is a
 * text label and the picker is a bonus; it is wrong for a control whose whole
 * job is to be a picker, because the affordance disappears — there is nothing
 * on screen that looks pressable.
 *
 * Native, so the calendar, the keyboard handling and the locale come from the
 * browser and there is no date-picker dependency to carry. `max` is what stops
 * a future date being chosen; note that it is a client-side bound only, so any
 * rule that actually matters still belongs on the server.
 */
export function DatePicker({
  value,
  onChange,
  max,
  min,
  label,
  className,
}: {
  value: string
  onChange: (next: string) => void
  /** `YYYY-MM-DD`. Pass `todayKey()` to disallow the future. */
  max?: string
  min?: string
  /** Names the control for screen readers — these carry no visible <label>. */
  label: string
  className?: string
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-sm rounded-md border border-surface-container-high',
        'bg-surface-container-lowest px-3 py-2 shadow-soft-lift transition-colors',
        'focus-within:border-primary-container',
        className,
      )}
    >
      <CalendarDays className="h-4 w-4 shrink-0 text-primary-container" aria-hidden />
      <input
        type="date"
        value={value}
        max={max}
        min={min}
        // An empty value means the field was cleared, which for a required date
        // is not a state any caller wants — ignore it and keep the last one.
        onChange={(e) => e.target.value && onChange(e.target.value)}
        aria-label={label}
        className="cursor-pointer bg-transparent font-mono text-label-md font-bold text-on-surface outline-none"
      />
    </label>
  )
}
