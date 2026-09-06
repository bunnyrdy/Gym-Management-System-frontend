import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Page header, with an optional Add button. Shared by every list screen.
 *
 * The Add control is optional because not every list creates anything -- the
 * pending-payments queue is a view onto members that already exist. Both props
 * or neither; every existing caller passes both and is unchanged.
 */
export function ListHeader({
  title,
  subtitle,
  addLabel,
  addRoute,
}: {
  title: string
  subtitle: string
  addLabel?: string
  addRoute?: string
}) {
  return (
    <div className="mb-xl flex flex-wrap items-end justify-between gap-md">
      <div>
        <h1 className="text-headline-lg text-on-background">{title}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">{subtitle}</p>
      </div>
      {addRoute && addLabel && (
        <Link
          to={addRoute}
          className="flex items-center gap-xs rounded-md bg-primary-container px-md py-2 font-mono text-label-md font-bold text-on-primary transition-colors hover:bg-primary"
        >
          <Plus className="h-4 w-4" aria-hidden /> {addLabel}
        </Link>
      )}
    </div>
  )
}

/**
 * The stat card every list screen puts above its table, and every card on the
 * dashboard.
 *
 * The optional props exist for the dashboard, where a card is a link into the
 * module it counts, some carry a second line ("this month", an outstanding
 * total), and two are tinted to mark urgency. They are additive on purpose:
 * the list screens pass none of them and are unchanged. Restyling a stat card
 * happens here rather than in a screen — a second copy of this component is how
 * two parts of the app start disagreeing about what a card looks like.
 *
 * `value` takes a string as well as a number so a money or ratio figure can use
 * the same card instead of being hand-rolled beside it.
 */
export function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  to,
  hint,
  accent,
  onSelect,
  selected,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  tone: string
  /** Makes the whole card a link. Omitted, it stays a plain panel. */
  to?: string
  /** A second line under the figure — "this month", "₹1,250 outstanding". */
  hint?: ReactNode
  /** The design's tinted corner, for the two cards that need attention. */
  accent?: 'primary' | 'error'
  /**
   * Makes the card a button that filters the page it already sits on, rather
   * than navigating to another one. Mutually exclusive with `to` — a card is
   * either a link somewhere or a control here, never both.
   */
  onSelect?: () => void
  /** Whether this card's filter is the one currently applied. */
  selected?: boolean
}) {
  const interactive = to !== undefined || onSelect !== undefined

  const body = (
    <>
      {accent && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-0 top-0 h-16 w-16 rounded-bl-full',
            accent === 'error' ? 'bg-error/10' : 'bg-primary-container/10',
          )}
        />
      )}

      <div className="relative mb-4 flex items-start justify-between">
        <span
          className={cn(
            'font-mono text-label-sm uppercase tracking-wider text-on-surface-variant',
            interactive && 'transition-colors group-hover:text-primary-container',
          )}
        >
          {label}
        </span>
        <Icon className={cn('h-5 w-5', tone)} />
      </div>

      <div className="relative text-headline-lg font-bold text-on-background">{value}</div>
      {hint && <div className="relative mt-1 font-mono text-label-sm text-on-surface-variant">{hint}</div>}
    </>
  )

  const className = cn(
    'card-surface relative overflow-hidden border p-md',
    selected ? 'border-primary-container' : 'border-surface-container-high/50',
    interactive && 'group block transition-colors hover:border-primary-container/50',
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    )
  }

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} className={cn(className, 'w-full text-left')}>
        {body}
      </button>
    )
  }

  return <div className={className}>{body}</div>
}

/** Table card + pagination footer. Callers supply headers and rows. */
export function TableCard({
  headers,
  children,
  page,
  totalPages,
  totalCount,
  onPage,
}: {
  headers: string[]
  children: ReactNode
  page?: number
  totalPages?: number
  totalCount?: number
  onPage?: (next: number) => void
}) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-container-high bg-surface-bright">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-md py-sm font-mono text-label-sm font-medium uppercase tracking-wider text-on-surface-variant"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high">{children}</tbody>
        </table>
      </div>

      {/* Compare explicitly rather than relying on truthiness: `{totalPages && …}`
          renders a literal 0 when the list is empty, because React prints falsy
          numbers. `!== undefined` also keeps TypeScript's narrowing. */}
      {page !== undefined && totalPages !== undefined && totalPages > 1 && onPage !== undefined && (
        <div className="flex items-center justify-between border-t border-surface-container-high px-md py-sm">
          <span className="font-mono text-label-sm text-on-surface-variant">
            Page {page} of {totalPages} · {totalCount} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-md border border-secondary-container px-3 py-1 font-mono text-label-md text-on-surface disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => onPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md border border-secondary-container px-3 py-1 font-mono text-label-md text-on-surface disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
