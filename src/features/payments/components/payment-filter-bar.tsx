import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { LEDGER_STATUS_LABELS } from '@/features/payments/types/payment'
import type { PaymentFilterState } from '@/features/payments/hooks/use-payment-filters'
import type { PlanOption } from '@/features/members/types/member'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Six years back is as far as this gym's ledger goes; the list is a convenience, not a limit. */
function recentYears(): number[] {
  const now = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => now - i)
}

/**
 * The payments filter bar. Same layout as the members one, so the two screens
 * read as one app.
 *
 * Every control now works on every tab, so nothing here is disabled. Month and
 * Year narrow `paid_at` on the three ledger tabs and the membership's
 * `start_date` on the two member-shaped ones; Status is the membership's payment
 * status either way. One bar, one meaning per control, whichever endpoint the
 * active tab reads.
 */
export function PaymentFilterBar({
  filters,
  plans,
  dirty,
  onChange,
  onClear,
}: {
  filters: PaymentFilterState
  plans: PlanOption[]
  dirty: boolean
  onChange: (patch: Partial<PaymentFilterState>) => void
  onClear: () => void
}) {
  return (
    <div className="card-surface mb-md flex flex-wrap items-center gap-2 p-2">
      <div className="relative min-w-[220px] flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
          aria-hidden
        />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search by name, member code, receipt no or phone"
          className="pl-10"
          aria-label="Search"
        />
      </div>

      {/* <Input
        value={filters.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        placeholder="Phone number"
        inputMode="tel"
        aria-label="Filter by phone number"
        className="w-auto min-w-[160px]"
      /> */}

      {/* A month needs a year; a year on its own is the "previous year" filter.
          The server rejects a month without one, so the control mirrors that. */}
      <Select
        value={filters.month}
        onChange={(e) => onChange({ month: e.target.value })}
        aria-label="Filter by month"
        className="w-auto min-w-[140px]"
      >
        <option value="">Any Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>{name}</option>
        ))}
      </Select>

      <Select
        value={filters.year}
        onChange={(e) => onChange({ year: e.target.value })}
        aria-label="Filter by year"
        className="w-auto min-w-[120px]"
      >
        <option value="">Any Year</option>
        {recentYears().map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>

      {/* Custom range, parked. Use <DatePicker> from components/ui if it returns.
          <DateBox
        label="From"
        value={filters.from}
        onChange={(v) => onChange({ from: v })}
      />
      <DateBox
        label="To"
        value={filters.to}
        onChange={(v) => onChange({ to: v })}
      /> */}

      <Select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value })}
        aria-label="Filter by payment status"
        className="w-auto min-w-[150px]"
      >
        <option value="">All Statuses</option>
        {Object.entries(LEDGER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>

      <Select
        value={filters.planId}
        onChange={(e) => onChange({ planId: e.target.value })}
        aria-label="Filter by plan"
        className="w-auto min-w-[150px]"
      >
        <option value="">All Plans</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </Select>

      {/* <div className={cn('px-sm', !supportsDates && 'opacity-50')} title={ledgerOnly}>
        <Checkbox
          checked={filters.balanceDueOnly}
            onChange={(e) => onChange({ balanceDueOnly: e.target.checked })}
          label="Balance due only"
        />
      </div> */}

      {dirty && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-secondary-container px-3 py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          Clear
        </button>
      )}
    </div>
  )
}
