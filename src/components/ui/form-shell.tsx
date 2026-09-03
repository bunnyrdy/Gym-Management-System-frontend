import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Breadcrumb + title + Cancel/Save header. Identical on every form screen. */
export function FormHeader({
  listLabel,
  listRoute,
  title,
  isEdit,
  saving,
  saveDisabled,
  onCancel,
  saveLabel,
}: {
  listLabel: string
  listRoute: string
  title: string
  isEdit: boolean
  saving: boolean
  saveDisabled: boolean
  onCancel: () => void
  saveLabel: string
}) {
  return (
    <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
      <div>
        <nav
          className="mb-2 flex items-center gap-1 font-mono text-label-sm text-on-surface-variant"
          aria-label="Breadcrumb"
        >
          <Link to={listRoute} className="transition-colors hover:text-primary">{listLabel}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-on-surface">{isEdit ? 'Edit' : 'Add'}</span>
        </nav>
        <h1 className="text-headline-lg text-on-background">{title}</h1>
      </div>

      <div className="flex gap-sm">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={saveDisabled}>
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}

/** Two-column layout: 8 cols of sections, 4 cols of sticky summary. */
export function FormLayout({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-lg lg:grid-cols-12">{children}</div>
}

export function FormColumn({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-xl lg:col-span-8">{children}</div>
}
