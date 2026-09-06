import { cn } from '@/utils/cn'

export interface TabItem {
  /** Stable identity. Also what a screen puts in `?tab=`. */
  key: string
  label: string
  /** Optional figure in the tab, for a queue whose size is worth seeing. */
  count?: number
}

/**
 * The underline tab strip.
 *
 * State-driven, not route-driven: it takes `value` / `onChange` rather than
 * rendering NavLinks. The website CMS has a route-driven copy of this strip
 * (features/site/components/cms-shell.tsx) because its five tabs are five URLs
 * — genuinely different semantics, deliberately not merged into this.
 *
 * The styling is copied from that strip verbatim so the two are
 * indistinguishable on screen. If the underline treatment ever changes, it
 * changes in both.
 *
 * Rendered as a `tablist` with roving `aria-selected` rather than a `<nav>`,
 * because these tabs swap a panel below rather than navigating.
 */
export function TabStrip({
  items,
  value,
  onChange,
  label,
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (next: string) => void
  /** Names the strip for screen readers — "Payment views", not "Tabs". */
  label: string
  className?: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex flex-wrap gap-xs border-b border-outline-variant', className)}
    >
      {items.map((tab) => {
        const active = tab.key === value
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              '-mb-px border-b-2 px-md py-3 font-mono text-label-md font-medium transition-colors',
              active
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-on-surface-variant hover:text-on-surface',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-label-sm',
                  active
                    ? 'bg-primary-container/10 text-primary-container'
                    : 'bg-surface-container-high text-on-surface-variant',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
