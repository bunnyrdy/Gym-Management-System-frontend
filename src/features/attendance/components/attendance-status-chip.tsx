import { Chip, type ChipTone } from '@/components/ui/status-chip'
import { formatTime } from '@/utils/date'
import { STATUS_LABELS, type AttendanceStatus } from '@/features/attendance/types/attendance'

/**
 * Attendance's four-state vocabulary, expressed in terms of the shared Chip.
 *
 * `week_off` and `not_marked` both read as neutral because neither is a fault:
 * one is a scheduled day off, the other is a day that has not finished yet.
 */
const tones: Record<AttendanceStatus, ChipTone> = {
  present: 'active',
  absent: 'error',
  not_marked: 'inactive',
  week_off: 'inactive',
}

export function AttendanceStatusChip({
  status,
  checkInAt,
  isLate,
  className,
}: {
  status: AttendanceStatus
  /** When present, the arrival time is appended: "Present · 08:42 AM". */
  checkInAt?: string | null
  isLate?: boolean
  className?: string
}) {
  const label =
    status === 'present' && checkInAt
      ? `${STATUS_LABELS.present} · ${formatTime(checkInAt)}`
      : STATUS_LABELS[status]

  return (
    <span className="inline-flex items-center gap-2">
      <Chip tone={tones[status]} label={label} className={className} />
      {isLate && (
        <span className="font-mono text-label-sm text-error" title="Arrived after the shift started">
          (Late)
        </span>
      )}
    </span>
  )
}
