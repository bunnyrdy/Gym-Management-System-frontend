import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounced } from '@/utils/use-debounced'
import type { MemberFilters } from '@/features/members/services/member.service'

export interface MemberFilterState {
  search: string
  /**
   * Whatever the one status combo selected: a membership state
   * (active / expiring_soon / expired / no_membership), or `inactive`, which is
   * the member's own status. `query` below splits the two apart.
   */
  status: string
  planId: string
  /** '' = any joining date, 'this_month' = joined in the branch's current month. */
  joined: string
}

const EMPTY: MemberFilterState = { search: '', status: '', planId: '', joined: '' }

/**
 * Search + status + plan + page, debounced. Same shape as usePlanFilters.
 *
 * The initial status and joining window are seeded from `?status=` and
 * `?joined=` so the dashboard's cards can
 * deep-link the list they counted — "Expired: 7" has to open the seven expired
 * members, not the whole roster. Read once, on mount: the URL is an entry
 * point, not a mirror of the filter bar, so typing in the bar afterwards does
 * not rewrite the address and the Back button still leaves the page.
 */
export function useMemberFilters(pageSize = 20) {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState<MemberFilterState>(() => ({
    ...EMPTY,
    status: params.get('status') ?? '',
    joined: params.get('joined') ?? '',
  }))
  const [page, setPage] = useState(1)
  const search = useDebounced(filters.search, 300)

  const update = (patch: Partial<MemberFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1) // a filtered result set has different pages
  }

  // One control, two server parameters. `inactive` is the member's own status;
  // everything else is a membership state — and picking a membership state also
  // pins memberStatus to active, because the cards above the table count those
  // states over active members only. Without that clause the Expired card and
  // the Expired filter would disagree, which is exactly what StatsAsync was
  // written to prevent.
  const query = useMemo<MemberFilters>(() => {
    const deactivated = filters.status === 'inactive'

    return {
      search: search || undefined,
      status: deactivated ? undefined : filters.status || undefined,
      memberStatus: deactivated ? 'inactive' : filters.status ? 'active' : undefined,
      planId: filters.planId ? Number(filters.planId) : undefined,
      joined: filters.joined || undefined,
      page,
      pageSize,
    }
  }, [search, filters.status, filters.planId, filters.joined, page, pageSize])

  return {
    filters,
    update,
    page,
    setPage,
    query,
    isFiltered: Boolean(filters.search || filters.status || filters.planId || filters.joined),
  }
}
