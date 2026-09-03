import { Link } from 'react-router-dom'
import { Users, CheckCircle2, UserMinus } from 'lucide-react'
import { useStaffList, useStaffLookups, useStaffStats } from '@/features/staff/hooks/use-staff'
import { useStaffFilters } from '@/features/staff/hooks/use-staff-filters'
import { StaffFilterBar } from '@/features/staff/components/staff-filter-bar'
import {
  ListHeader,
  SummaryCard,
  TableCard,
} from '@/components/ui/list-shell'
import { Avatar } from '@/components/ui/avatar'
import { StatusChip } from '@/components/ui/status-chip'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/constants/routes'

const HEADERS = ['Profile', 'Contact', 'Shift & Experience', 'Responsibilities', 'Status', '']

export default function ReceptionistListPage() {
  const f = useStaffFilters()
  const { data, isLoading, isError } = useStaffList('receptionists', f.query)
  const { shifts } = useStaffLookups()
  const stats = useStaffStats('receptionists')

  const rows = data?.items ?? []

  return (
    <>
      <ListHeader
        title="Receptionists"
        subtitle="Manage receptionists, schedules and responsibilities"
        addLabel="Add Receptionist"
        addRoute={ROUTES.RECEPTIONIST_NEW}
      />

      <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-3">
        {/* Counted over the branch, not the page in front of you. */}
        <SummaryCard label="Total" value={stats.data?.total ?? 0} icon={Users} tone="text-on-surface-variant" />
        <SummaryCard label="Active" value={stats.data?.active ?? 0} icon={CheckCircle2} tone="text-status-active" />
        <SummaryCard label="Inactive" value={stats.data?.inactive ?? 0} icon={UserMinus} tone="text-on-surface-variant" />
      </div>

      <StaffFilterBar
        {...f.filters}
        shifts={shifts.data ?? []}
        placeholder="Search by name, code, email or phone..."
        onChange={f.update}
      />

      <TableCard
        headers={HEADERS}
        page={data?.page}
        totalPages={data?.totalPages}
        totalCount={data?.totalCount}
        onPage={f.setPage}
      >
        {isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center"><Spinner className="mx-auto text-primary-container" /></td></tr>
        )}

        {isError && !isLoading && (
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-error">Could not load receptionists.</td></tr>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <tr>
            <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
              No receptionists {f.isFiltered ? 'match these filters' : 'yet'}.
            </td>
          </tr>
        )}

        {rows.map((r) => (
          <tr key={r.id} className="transition-colors hover:bg-surface-container-low">
            <td className="px-md py-sm">
              <div className="flex items-center gap-sm">
                <Avatar name={r.fullName} src={r.photoUrl} className="h-10 w-10" />
                <div>
                  <div className="font-mono text-label-md font-bold text-on-surface">{r.fullName}</div>
                  <div className="font-mono text-label-sm text-on-surface-variant">{r.staffCode}</div>
                </div>
              </div>
            </td>
            <td className="px-md py-sm">
              <div className="text-body-md text-on-surface">{r.phone}</div>
              <div className="font-mono text-label-sm text-on-surface-variant">{r.email ?? '—'}</div>
            </td>
            <td className="px-md py-sm">
              <div className="text-body-md text-on-surface">{r.shiftName ?? 'No shift'}</div>
              <div className="font-mono text-label-sm text-on-surface-variant">
                {r.experienceYears != null ? `${r.experienceYears} yrs` : '—'}
              </div>
            </td>
            <td className="px-md py-sm">
              <div className="flex flex-wrap gap-1">
                {r.responsibilities.length === 0 && <span className="text-body-md text-on-surface-variant">—</span>}
                {r.responsibilities.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-container px-2 py-0.5 font-mono text-label-sm text-on-surface-variant">
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-md py-sm"><StatusChip status={r.status} /></td>
            <td className="px-md py-sm text-right">
              <Link
                to={ROUTES.receptionistDetails(r.id)}
                className="inline-flex items-center gap-1 font-mono text-label-md text-primary-container hover:text-primary"
                aria-label={`Open ${r.fullName}`}
              >
                View
              </Link>
            </td>
          </tr>
        ))}
      </TableCard>
    </>
  )
}
