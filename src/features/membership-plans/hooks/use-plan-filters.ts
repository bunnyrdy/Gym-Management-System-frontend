import { useMemo, useState } from 'react'
import { useDebounced } from '@/utils/use-debounced'
import type { PlanFilters } from '@/features/membership-plans/services/plan.service'

export interface PlanFilterState {
  search: string
  status: string
}

const EMPTY: PlanFilterState = { search: '', status: '' }

/** Search + status + page, debounced. The same shape as useStaffFilters. */
export function usePlanFilters(pageSize = 20) {
  const [filters, setFilters] = useState<PlanFilterState>(EMPTY)
  const [page, setPage] = useState(1)
  const search = useDebounced(filters.search, 300)

  const update = (patch: Partial<PlanFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1) // a filtered result set has different pages
  }

  const query = useMemo<PlanFilters>(
    () => ({
      search: search || undefined,
      status: filters.status || undefined,
      page,
      pageSize,
    }),
    [search, filters.status, page, pageSize],
  )

  return {
    filters,
    update,
    page,
    setPage,
    query,
    isFiltered: Boolean(filters.search || filters.status),
  }
}
