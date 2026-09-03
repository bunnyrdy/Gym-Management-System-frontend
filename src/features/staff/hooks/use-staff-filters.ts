import { useMemo, useState } from 'react'
import { useDebounced } from '@/utils/use-debounced'

/** Filter state + a debounced query object, shared by both list screens. */
export function useStaffFilters(pageSize = 20) {
  const [filters, setFilters] = useState({ search: '', status: '', gender: '', shiftId: '' })
  const [page, setPage] = useState(1)

  // One request per pause in typing, not one per keystroke.
  const debouncedSearch = useDebounced(filters.search, 300)

  const update = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      gender: filters.gender || undefined,
      shiftId: filters.shiftId ? Number(filters.shiftId) : undefined,
      page,
      pageSize,
    }),
    [debouncedSearch, filters.status, filters.gender, filters.shiftId, page, pageSize],
  )

  return {
    filters,
    update,
    page,
    setPage,
    query,
    isFiltered: Boolean(debouncedSearch || filters.status || filters.gender || filters.shiftId),
  }
}
