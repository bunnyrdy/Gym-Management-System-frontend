import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { StatusChip } from '@/components/ui/status-chip'
import type { StaffStatus } from '@/features/staff/types/staff'

/** Sticky right-hand summary. Shared shell; each role passes its own rows. */
export function StaffSummaryPanel({
  name,
  photoUrl,
  status,
  badge,
  children,
}: {
  name: string
  photoUrl: string | null
  status: StaffStatus
  badge?: string | null
  children: ReactNode
}) {
  return (
    <aside className="lg:sticky lg:top-[100px] lg:col-span-4">
      <div className="card-surface flex flex-col items-center overflow-hidden border border-surface-container-highest shadow-defined-lift">
        <div className="h-1.5 w-full bg-primary-container" aria-hidden />

        <div className="flex w-full flex-col items-center p-md">
          <Avatar
            name={name || '?'}
            src={photoUrl}
            className="mb-4 h-24 w-24 border-4 border-surface text-headline-md"
          />
          <h2 className="mb-1 text-center text-headline-md text-on-surface">{name || 'New Staff Member'}</h2>

          {badge && (
            <span className="mb-2 rounded-full bg-surface-container px-3 py-1 font-mono text-label-sm text-on-surface-variant">
              {badge}
            </span>
          )}

          <StatusChip status={status} className="mb-md" />

          <dl className="w-full space-y-1">{children}</dl>
        </div>
      </div>
    </aside>
  )
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-md border-b border-surface-container py-2 last:border-0">
      <dt className="shrink-0 font-mono text-label-sm text-on-surface-variant">{label}</dt>
      <dd className="truncate text-body-md font-semibold text-on-surface" title={value}>{value}</dd>
    </div>
  )
}
