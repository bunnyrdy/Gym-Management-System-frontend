import { cn } from '@/utils/cn'
import { WEEKDAYS } from '@/features/staff/types/staff'

/**
 * The M T W T F S S toggles from the design. Values are ISO weekdays (1=Mon),
 * matching `staff_shift_assignments.working_days` and its DB CHECK.
 */
export function WeekdayPicker({
  value,
  onChange,
  disabled,
}: {
  value: number[]
  onChange: (next: number[]) => void
  disabled?: boolean
}) {
  const toggle = (day: number) =>
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort((a, b) => a - b))

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Working days">
      {WEEKDAYS.map((day) => {
        const on = value.includes(day.value)
        return (
          <button
            key={day.value}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            aria-label={day.full}
            title={day.full}
            onClick={() => toggle(day.value)}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full font-mono text-label-md font-bold transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              on
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
            )}
          >
            {day.label}
          </button>
        )
      })}
    </div>
  )
}
