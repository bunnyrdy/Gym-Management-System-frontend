import { Check } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/common/alert'
import { cn } from '@/utils/cn'
import type { PlanServiceOption } from '@/features/membership-plans/types/plan'

/**
 * The "Included Services" grid. Options come from `plan_services` via the API,
 * so a tenth service is an INSERT rather than a change here.
 */
export function ServicesPicker({
  options,
  value,
  onChange,
  loading = false,
  error = false,
}: {
  options: PlanServiceOption[]
  value: number[]
  onChange: (next: number[]) => void
  loading?: boolean
  error?: boolean
}) {
  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  if (loading)
    return (
      <div className="flex items-center gap-sm py-md text-on-surface-variant">
        <Spinner size="sm" /> <span className="text-body-md">Loading services…</span>
      </div>
    )

  if (error) return <Alert variant="error">Could not load the services list.</Alert>

  if (options.length === 0)
    return <p className="text-body-md text-on-surface-variant">No services configured.</p>

  return (
    <div className="grid grid-cols-1 gap-sm sm:grid-cols-2" role="group" aria-label="Included services">
      {options.map((service) => {
        const on = value.includes(service.id)
        return (
          <label
            key={service.id}
            className={cn(
              'flex cursor-pointer items-center gap-sm rounded-md border p-3 transition-colors',
              'focus-within:ring-2 focus-within:ring-primary-container focus-within:ring-offset-2',
              on
                ? 'border-primary-container bg-primary-container/10'
                : 'border-secondary-container hover:bg-surface-container-low',
            )}
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => toggle(service.id)}
              className="sr-only"
            />
            {/* Drawn rather than a native checkbox so the tick is the brand
                orange the design shows, in every browser. */}
            <span
              aria-hidden
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors',
                on
                  ? 'border-primary-container bg-primary-container text-on-primary'
                  : 'border-secondary-container bg-surface-container-lowest',
              )}
            >
              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span className="text-body-md text-on-surface">{service.name}</span>
          </label>
        )
      })}
    </div>
  )
}
