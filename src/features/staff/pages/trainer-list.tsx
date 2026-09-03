import { Link } from 'react-router-dom'
import { Users, CheckCircle2, UserMinus, HeartHandshake } from 'lucide-react'
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
import { GENDER_LABELS, hhmm } from '@/features/staff/types/staff'

const HEADERS = ['Profile', 'Contact Info', 'Shift & Exp.', 'Specialization', 'PT Clients', 'Status', '']

export default function TrainerListPage() {
  const f = useStaffFilters()
  const { data, isLoading, isError } = useStaffList('trainers', f.query)
  const { shifts } = useStaffLookups()
  const stats = useStaffStats('trainers')

  const rows = data?.items ?? []

  return (
    <>
      <ListHeader
        title="Trainers"
        subtitle="Manage trainers, schedules and assigned clients"
        addLabel="Add Trainer"
        addRoute={ROUTES.TRAINER_NEW}
      />

      <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
        {/* Counted over the branch, not the page in front of you — these used
            to say "on this page" because they were filters over 20 rows. */}
        <SummaryCard label="Total" value={stats.data?.total ?? 0} icon={Users} tone="text-on-surface-variant" />
        <SummaryCard label="Active" value={stats.data?.active ?? 0} icon={CheckCircle2} tone="text-status-active" />
        <SummaryCard label="Inactive" value={stats.data?.inactive ?? 0} icon={UserMinus} tone="text-on-surface-variant" />
        <SummaryCard label="With PT clients" value={stats.data?.withPtClients ?? 0} icon={HeartHandshake} tone="text-primary-container" />
      </div>

      <StaffFilterBar
        {...f.filters}
        shifts={shifts.data ?? []}
        showGender
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
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-error">Could not load trainers.</td></tr>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <tr>
            <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
              No trainers {f.isFiltered ? 'match these filters' : 'yet'}.
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
                  <div className="font-mono text-label-sm text-on-surface-variant">
                    {r.staffCode}
                    {r.gender && ` · ${GENDER_LABELS[r.gender]}`}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-md py-sm">
              <div className="text-body-md text-on-surface">{r.phone}</div>
              <div className="font-mono text-label-sm text-on-surface-variant">{r.email ?? '—'}</div>
            </td>
            <td className="px-md py-sm">
              <div className="text-body-md text-on-surface">
                {r.shiftName ?? 'No shift'}
                {r.shiftStart && ` (${hhmm(r.shiftStart)}–${hhmm(r.shiftEnd)})`}
              </div>
              <div className="font-mono text-label-sm text-on-surface-variant">
                {r.experienceYears != null ? `${r.experienceYears} yrs exp.` : '—'}
              </div>
            </td>
            <td className="px-md py-sm">
              {r.specialization ? (
                <span className="rounded-full bg-primary-container/10 px-3 py-1 font-mono text-label-sm text-primary">
                  {r.specialization}
                </span>
              ) : (
                <span className="text-body-md text-on-surface-variant">—</span>
              )}
            </td>
            <td className="px-md py-sm">
              <span className="font-mono text-label-md font-bold text-on-surface">{r.ptClientCount}</span>
            </td>
            <td className="px-md py-sm"><StatusChip status={r.status} /></td>
            <td className="px-md py-sm text-right">
              <Link
                to={ROUTES.trainerDetails(r.id)}
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
