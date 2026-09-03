import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { MEMBERSHIP_STATE_LABELS, type PlanOption } from '@/features/members/types/member'

/**
 * Search + status + plan + joining-window toolbar for the members list.
 *
 * Joining window is its own control rather than another entry in the status
 * combo: that combo already mixes two vocabularies (a membership state and the
 * member's own status, split apart by useMemberFilters), and "joined this
 * month" is a third question entirely.
 */
export function MemberFilterBar({
  search,
  status,
  planId,
  joined,
  plans,
  onChange,
}: {
  search: string
  status: string
  planId: string
  joined: string
  plans: PlanOption[]
  onChange: (patch: { search?: string; status?: string; planId?: string; joined?: string }) => void
}) {
  const dirty = search || status || planId || joined

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
          placeholder="Search by name, phone, email or code"
          className="pl-10"
          aria-label="Search"
        />
      </div>

      {/* One control, two vocabularies. The first four options are membership
          states; "Inactive" is the member's own status. useMemberFilters splits
          them back into the two query parameters the API takes. */}
      <Select
        value={status}
        onChange={(e) => onChange({ status: e.target.value })}
        aria-label="Filter by status"
        className="w-auto min-w-[170px]"
      >
        <option value="">All Statuses</option>
        {Object.entries(MEMBERSHIP_STATE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
        <option value="inactive">Inactive</option>
      </Select>

      <Select
        value={planId}
        onChange={(e) => onChange({ planId: e.target.value })}
        aria-label="Filter by plan"
        className="w-auto min-w-[170px]"
      >
        <option value="">All Plans</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </Select>

      <Select
        value={joined}
        onChange={(e) => onChange({ joined: e.target.value })}
        aria-label="Filter by joining date"
        className="w-auto min-w-[150px]"
      >
        <option value="">All Time</option>
        <option value="this_month">Joined This Month</option>
      </Select>

      {dirty && (
        <button
          type="button"
          onClick={() => onChange({ search: '', status: '', planId: '', joined: '' })}
          className="rounded-md border border-secondary-container px-3 py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          Clear
        </button>
      )}
    </div>
  )
}
