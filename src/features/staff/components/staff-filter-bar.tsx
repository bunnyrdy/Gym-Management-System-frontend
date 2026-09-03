import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  GENDER_LABELS,
  STATUS_LABELS,
  type ShiftOption,
} from '@/features/staff/types/staff'

/** Search + filters toolbar. `showGender` matches the trainer list design. */
export function StaffFilterBar({
  search,
  status,
  gender,
  shiftId,
  shifts,
  showGender = false,
  placeholder,
  onChange,
}: {
  search: string
  status: string
  gender: string
  shiftId: string
  shifts: ShiftOption[]
  showGender?: boolean
  placeholder: string
  onChange: (patch: { search?: string; status?: string; gender?: string; shiftId?: string }) => void
}) {
  const dirty = search || status || gender || shiftId

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
          placeholder={placeholder}
          className="pl-10"
          aria-label="Search"
        />
      </div>

      <Select
        value={status}
        onChange={(e) => onChange({ status: e.target.value })}
        aria-label="Filter by status"
        className="w-auto min-w-[150px]"
      >
        <option value="">Status: All</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>

      {showGender && (
        <Select
          value={gender}
          onChange={(e) => onChange({ gender: e.target.value })}
          aria-label="Filter by gender"
          className="w-auto min-w-[140px]"
        >
          <option value="">Gender: All</option>
          {Object.entries(GENDER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      )}

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

      {dirty && (
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '', gender: '', shiftId: '' })}
          className="rounded-md border border-secondary-container px-3 py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          Clear
        </button>
      )}
    </div>
  )
}
