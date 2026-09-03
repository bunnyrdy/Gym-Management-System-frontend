import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ROLE_LABELS, STATUS_LABELS } from '@/features/attendance/types/attendance'
import type { AttendanceFilterState } from '@/features/attendance/hooks/use-attendance-filters'

interface ShiftOption {
  id: number
  name: string
}

/** Search + role + shift + status toolbar. Same shape as StaffFilterBar. */
export function AttendanceFilterBar({
  search,
  role,
  shiftId,
  status,
  shifts,
  onChange,
}: AttendanceFilterState & {
  shifts: ShiftOption[]
  onChange: (patch: Partial<AttendanceFilterState>) => void
}) {
  const dirty = search || role || shiftId || status

  return (
    <div className="card-surface mb-md flex flex-wrap items-center gap-2 p-2">
      <div className="relative min-w-[220px] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search staff by name, code or phone…"
          className="pl-10"
          aria-label="Search staff"
        />
      </div>

      <Select
        value={role}
        onChange={(e) => onChange({ role: e.target.value })}
        aria-label="Filter by role"
        className="w-auto min-w-[150px]"
      >
        <option value="">Role: All</option>
        {Object.entries(ROLE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>

      <Select
        value={shiftId}
        onChange={(e) => onChange({ shiftId: e.target.value })}
        aria-label="Filter by shift"
        className="w-auto min-w-[140px]"
      >
        <option value="">Shift: All</option>
        {shifts.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </Select>

      <Select
        value={status}
        onChange={(e) => onChange({ status: e.target.value })}
        aria-label="Filter by attendance status"
        className="w-auto min-w-[160px]"
      >
        <option value="">Status: All</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>

      {dirty && (
        <button
          type="button"
          onClick={() => onChange({ search: '', role: '', shiftId: '', status: '' })}
          className="rounded-md border border-secondary-container px-3 py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          Clear
        </button>
      )}
    </div>
  )
}
