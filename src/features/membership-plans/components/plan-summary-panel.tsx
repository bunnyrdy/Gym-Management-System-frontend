import { CheckCircle2, Eye } from 'lucide-react'
import { Chip } from '@/components/ui/status-chip'
import { CURRENCY_SYMBOL } from '@/utils/currency'
import {
  durationLabel,
  formatPrice,
  type DurationUnit,
  type PlanServiceOption,
} from '@/features/membership-plans/types/plan'

/**
 * The live preview from the design: what the plan will look like once saved.
 * Everything here is driven by `watch()`, so it updates as the form is typed.
 */
export function PlanSummaryPanel({
  name,
  durationValue,
  durationUnit,
  price,
  isActive,
  services,
  planCode,
}: {
  name: string
  durationValue: number
  durationUnit: DurationUnit
  price: number
  isActive: boolean
  services: PlanServiceOption[]
  planCode: string | null
}) {
  return (
    <aside className="lg:sticky lg:top-[100px] lg:col-span-4">
      <div className="card-surface overflow-hidden border border-surface-container-highest shadow-defined-lift">
        <div className="h-1.5 w-full bg-primary-container" aria-hidden />

        <div className="p-md">
          <h3 className="mb-md flex items-center gap-xs font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
            <Eye className="h-4 w-4" aria-hidden /> Plan Summary Preview
          </h3>

          <div className="mb-md text-center">
            <Chip
              tone={isActive ? 'active' : 'inactive'}
              label={isActive ? 'Active' : 'Inactive'}
              className="mb-4"
            />
            <h2 className="mb-1 text-headline-md text-on-surface">{name || 'New Plan'}</h2>
            <p className="font-mono text-label-md text-on-surface-variant">
              {durationLabel(durationValue, durationUnit)}
            </p>
          </div>

          <div className="mb-md rounded-md border border-surface-variant bg-background p-4 text-center">
            <span className="mb-1 block font-mono text-label-sm text-on-surface-variant">
              Total Price
            </span>
            <div className="flex items-end justify-center gap-1">
              <span className="mb-1 text-headline-md text-on-surface">{CURRENCY_SYMBOL}</span>
              <span className="text-display-lg leading-none text-primary-container">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {services.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No services selected yet.</p>
          ) : (
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary-container"
                    aria-hidden
                  />
                  <span className="text-body-md text-on-surface">{s.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface-variant bg-surface-container-low px-md py-3">
          <span className="font-mono text-label-sm text-on-surface-variant">
            Code: <span className="text-on-surface">{planCode ?? 'auto-generated'}</span>
          </span>
        </div>
      </div>
    </aside>
  )
}
