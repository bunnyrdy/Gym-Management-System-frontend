import { cn } from '@/utils/cn'
import type { TagOption } from '@/features/staff/types/staff'

/** Multi-select responsibilities, rendered as toggleable pills. */
export function TagPicker({
  options,
  value,
  onChange,
}: {
  options: TagOption[]
  value: number[]
  onChange: (next: number[]) => void
}) {
  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  if (options.length === 0)
    return <p className="text-body-md text-on-surface-variant">No responsibilities configured.</p>

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Responsibilities">
      {options.map((tag) => {
        const on = value.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(tag.id)}
            className={cn(
              'rounded-full border px-4 py-2 font-mono text-label-md transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
              on
                ? 'border-primary-container bg-primary-container/10 text-primary'
                : 'border-secondary-container text-on-surface-variant hover:bg-surface-container-low',
            )}
          >
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
