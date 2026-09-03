import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, CreditCard, Eye, EyeOff, Pencil } from 'lucide-react'
import { usePlanList, useArchivePlan } from '@/features/membership-plans/hooks/use-plans'
import { usePlanFilters } from '@/features/membership-plans/hooks/use-plan-filters'
import { PlanFilterBar } from '@/features/membership-plans/components/plan-filter-bar'
import { durationLabel } from '@/features/membership-plans/types/plan'
import { formatMoney } from '@/utils/currency'
import { ListHeader, SummaryCard, TableCard } from '@/components/ui/list-shell'
import { Chip } from '@/components/ui/status-chip'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/constants/routes'

const HEADERS = ['Plan Name', 'Duration', 'Price', 'Services', 'Status', '']

export default function PlanListPage() {
  const f = usePlanFilters()
  const { data, isLoading, isError } = usePlanList(f.query)
  const archive = useArchivePlan()

  const [archiving, setArchiving] = useState<{ id: number; name: string } | null>(null)

  const rows = data?.items ?? []
  const active = rows.filter((p) => p.isActive).length

  return (
    <>
      <ListHeader
        title="Membership Plans"
        subtitle="What the gym sells: duration, price and the services each plan includes."
        addLabel="Add New Plan"
        addRoute={ROUTES.PLAN_NEW}
      />

      <div className="mb-xl grid grid-cols-1 gap-sm sm:grid-cols-3">
        <SummaryCard label="Plans on this page" value={rows.length} icon={CreditCard} tone="text-primary-container" />
        <SummaryCard label="Active" value={active} icon={Eye} tone="text-status-active" />
        <SummaryCard label="Inactive" value={rows.length - active} icon={EyeOff} tone="text-on-surface-variant" />
      </div>

      <PlanFilterBar {...f.filters} onChange={f.update} />

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
          <tr><td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-error">Could not load membership plans.</td></tr>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <tr>
            <td colSpan={HEADERS.length} className="px-md py-xl text-center text-body-md text-on-surface-variant">
              No plans {f.isFiltered ? 'match these filters' : 'yet'}.
            </td>
          </tr>
        )}

        {rows.map((p) => (
          <tr key={p.id} className="transition-colors hover:bg-surface-container-low">
            <td className="px-md py-sm">
              <div className="text-body-md font-semibold text-on-surface">{p.name}</div>
              <div className="font-mono text-label-sm text-on-surface-variant">{p.planCode ?? '—'}</div>
            </td>
            <td className="px-md py-sm text-body-md text-on-surface">
              {durationLabel(p.durationValue, p.durationUnit)}
            </td>
            <td className="px-md py-sm font-mono text-label-md font-bold text-on-surface">
              {formatMoney(p.price)}
            </td>
            <td className="px-md py-sm font-mono text-label-sm text-on-surface-variant">
              {p.serviceCount} included
            </td>
            <td className="px-md py-sm">
              <Chip tone={p.isActive ? 'active' : 'inactive'} label={p.isActive ? 'Active' : 'Inactive'} />
            </td>
            <td className="px-md py-sm">
              <div className="flex items-center justify-end gap-md">
                <Link
                  to={ROUTES.planEdit(p.id)}
                  className="inline-flex items-center gap-1 font-mono text-label-md text-primary-container hover:text-primary"
                  aria-label={`Edit ${p.name}`}
                >
                  <Pencil className="h-4 w-4" aria-hidden /> Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setArchiving({ id: p.id, name: p.name })}
                  className="inline-flex items-center gap-1 font-mono text-label-md text-on-surface-variant transition-colors hover:text-error"
                  aria-label={`Archive ${p.name}`}
                >
                  <Archive className="h-4 w-4" aria-hidden /> Archive
                </button>
              </div>
            </td>
          </tr>
        ))}
      </TableCard>

      <ConfirmDialog
        open={archiving !== null}
        title="Archive this plan?"
        body={`${archiving?.name ?? 'This plan'} will stop appearing here and can no longer be sold. Members already on it keep their membership.`}
        confirmLabel="Archive plan"
        loading={archive.isPending}
        onCancel={() => setArchiving(null)}
        onConfirm={() =>
          archive.mutate(archiving!.id, { onSettled: () => setArchiving(null) })
        }
      />
    </>
  )
}
