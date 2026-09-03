import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowDown, ArrowUp, ExternalLink, Trash2 } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import { Chip } from '@/components/ui/status-chip'

/**
 * The chrome the five CMS screens share: the tab strip, the section card and
 * the reorder/delete row controls.
 *
 * One file rather than five near-identical headers. Every screen under
 * `/app/website` is "a list of one content type with an order and a visibility
 * toggle", so the differences live in the row renderer and nowhere else.
 */
const TABS = [
  { label: 'Settings', to: ROUTES.WEBSITE },
  { label: 'Gallery', to: ROUTES.WEBSITE_MEDIA },
  { label: 'Offers', to: ROUTES.WEBSITE_OFFERS },
  { label: 'Transformations', to: ROUTES.WEBSITE_TRANSFORMATIONS },
  { label: 'Events', to: ROUTES.WEBSITE_EVENTS },
] as const

export function CmsPage({
  title,
  subtitle,
  children,
  action,
}: {
  title: string
  subtitle: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="text-headline-lg text-on-background">{title}</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{subtitle}</p>
        </div>

        <div className="flex items-center gap-sm">
          {action}
          {/* A CMS whose editor cannot see the result is a CMS nobody trusts.
              Opens in a new tab so the admin session and the page being
              checked stay side by side. */}
          <a
            href={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-xs rounded-md border-[1.5px] border-on-surface px-md py-2 font-mono text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <ExternalLink className="h-4 w-4" aria-hidden /> View site
          </a>
        </div>
      </div>

      <nav aria-label="Website sections" className="flex flex-wrap gap-xs border-b border-outline-variant">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-md py-3 font-mono text-label-md font-medium transition-colors',
                isActive
                  ? 'border-primary-container text-primary-container'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {children}
    </div>
  )
}

/** A panel on a CMS screen. Same surface as `card-surface`, with a heading. */
export function CmsSection({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="card-surface p-md">
      <header className="mb-md">
        <h2 className="text-headline-md text-on-surface">{title}</h2>
        {description && (
          <p className="mt-1 text-body-md text-on-surface-variant">{description}</p>
        )}
      </header>
      {children}
      {footer && <div className="mt-md border-t border-outline-variant pt-md">{footer}</div>}
    </section>
  )
}

/**
 * Move-up / move-down / delete for one row.
 *
 * ponytail: arrow buttons rather than drag-and-drop. Reordering a dozen gallery
 * photos is two clicks either way, and this needs no dependency, works on a
 * phone, and is operable from the keyboard without any extra work. If a gym
 * ever has fifty items and complains, dnd-kit goes here and the API does not
 * change — `reorder` already takes the whole ordered run.
 */
export function RowControls({
  onUp,
  onDown,
  onDelete,
  isFirst,
  isLast,
  busy,
}: {
  onUp: () => void
  onDown: () => void
  onDelete: () => void
  isFirst: boolean
  isLast: boolean
  busy?: boolean
}) {
  const iconClass =
    'grid h-8 w-8 place-items-center rounded transition-colors disabled:opacity-30 disabled:pointer-events-none'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onUp}
        disabled={isFirst || busy}
        aria-label="Move up"
        className={cn(iconClass, 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface')}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={isLast || busy}
        aria-label="Move down"
        className={cn(iconClass, 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface')}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        aria-label="Delete"
        className={cn(iconClass, 'text-error hover:bg-error-container')}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Published / Hidden, using the shared chip so it matches every other status. */
export function VisibilityChip({ isActive }: { isActive: boolean }) {
  return <Chip tone={isActive ? 'active' : 'inactive'} label={isActive ? 'Published' : 'Hidden'} />
}

/**
 * Moves one item within a list and returns the new id order, or null when the
 * move is a no-op.
 *
 * Pure and shared because all four screens do the same thing, and getting the
 * swap wrong is the kind of bug that only shows up on the last row.
 */
export function movedOrder<T extends { id: number }>(
  items: T[],
  index: number,
  direction: -1 | 1,
): number[] | null {
  const target = index + direction
  if (target < 0 || target >= items.length) return null

  const next = [...items]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  return next.map((item) => item.id)
}
