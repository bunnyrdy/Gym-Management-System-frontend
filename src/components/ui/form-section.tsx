import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * The card wrapper every form section uses. Level-1 surface, 12px radius, soft
 * lift, header with an icon and a bottom border — straight from DESIGN.md, and
 * the reason every staff screen will look like the same product.
 */
export function FormSection({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string
  icon: LucideIcon
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="card-surface border border-surface-container-highest p-md">
      <header className="mb-md flex items-center justify-between gap-sm border-b border-surface-container pb-sm">
        <div className="flex items-center gap-sm">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-headline-md text-on-surface">{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
