import { cn } from '@/utils/cn'
import { STATUS_LABELS, type StaffStatus } from '@/features/staff/types/staff'

/**
 * Pill-shaped status tag. DESIGN.md > Components: low-opacity background of the
 * status colour, high-contrast text.
 */
export type ChipTone = 'active' | 'pending' | 'inactive' | 'error'

const toneStyles: Record<ChipTone, string> = {
  active: 'bg-status-active/10 text-status-active',
  pending: 'bg-status-pending/10 text-status-pending',
  inactive: 'bg-on-surface-variant/10 text-on-surface-variant',
  error: 'bg-error/10 text-error',
}

const base = 'inline-flex items-center rounded-full px-3 py-1 font-mono text-label-sm font-medium'

/** The primitive. Anything with a good/waiting/off/bad state uses this. */
export function Chip({
  tone,
  label,
  className,
}: {
  tone: ChipTone
  label: string
  className?: string
}) {
  return <span className={cn(base, toneStyles[tone], className)}>{label}</span>
}

/** Staff's four-state vocabulary, expressed in terms of the primitive above. */
const staffTones: Record<StaffStatus, ChipTone> = {
  active: 'active',
  inactive: 'inactive',
  on_leave: 'pending',
  terminated: 'error',
}

export function StatusChip({ status, className }: { status: StaffStatus; className?: string }) {
  return <Chip tone={staffTones[status]} label={STATUS_LABELS[status]} className={className} />
}
