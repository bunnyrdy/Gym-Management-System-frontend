import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/**
 * The `int[]` of reminder offsets, as chips.
 *
 * Up/down number inputs would suggest an order that does not exist — the server
 * sorts and de-duplicates the list — and a comma-separated text field turns a
 * typo into a validation error instead of an impossible state.
 */
export function ReminderDays({
  value,
  onChange,
  disabled,
}: {
  value: number[]
  onChange: (next: number[]) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const n = Number(draft)
    if (!Number.isInteger(n) || n < 0 || n > 90 || value.includes(n)) return
    onChange([...value, n].sort((a, b) => b - a))
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-sm">
      <ul className="flex flex-wrap gap-xs">
        {value.length === 0 && (
          <li className="text-body-md text-on-surface-variant">
            No reminders — members hear nothing before their membership lapses.
          </li>
        )}

        {value.map((days) => (
          <li key={days}>
            <span className="inline-flex items-center gap-xs rounded-full bg-surface-container-high px-md py-1.5 font-mono text-label-md text-on-surface">
              {days === 0 ? 'On the day' : `${days} day${days === 1 ? '' : 's'} before`}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value.filter((d) => d !== days))}
                aria-label={`Remove the ${days}-day reminder`}
                className="text-on-surface-variant transition-colors hover:text-error disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-sm">
        <Input
          type="number"
          min={0}
          max={90}
          inputMode="numeric"
          value={draft}
          disabled={disabled || value.length >= 5}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="Days before"
          aria-label="Days before expiry"
          className="max-w-[10rem]"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || draft === '' || value.length >= 5}
          onClick={add}
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden /> Add
        </Button>
      </div>
    </div>
  )
}
