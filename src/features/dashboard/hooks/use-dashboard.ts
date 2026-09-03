import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/features/dashboard/services/dashboard.service'

export const keys = {
  all: ['dashboard'] as const,
  summary: ['dashboard', 'summary'] as const,
}

/**
 * The dashboard payload. Inherits the global staleTime (5 min) and retry — the
 * numbers are a snapshot of a working day, not a live ticker, and a landing
 * page that refetches on every focus is a page that flickers.
 *
 * Marking attendance from this screen invalidates `keys.all` alongside the
 * attendance module's own key, which is why that root is exported.
 */
export function useDashboard() {
  return useQuery({
    queryKey: keys.summary,
    queryFn: () => dashboardService.summary().then((r) => r.data),
  })
}
