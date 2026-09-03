import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

/** Search + visibility toolbar for the plan list. */
export function PlanFilterBar({
  search,
  status,
  onChange,
}: {
  search: string
  status: string
  onChange: (patch: { search?: string; status?: string }) => void
}) {
  const dirty = search || status

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
          placeholder="Search plans by name or code"
          className="pl-10"
          aria-label="Search"
        />
      </div>

      <Select
        value={status}
        onChange={(e) => onChange({ status: e.target.value })}
        aria-label="Filter by visibility"
        className="w-auto min-w-[160px]"
      >
        <option value="">Visibility: All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>

      {dirty && (
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '' })}
          className="rounded-md border border-secondary-container px-3 py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          Clear
        </button>
      )}
    </div>
  )
}
