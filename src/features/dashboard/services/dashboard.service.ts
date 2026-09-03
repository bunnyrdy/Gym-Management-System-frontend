import { api } from '@/services/api'
import type { DashboardSummary } from '@/features/dashboard/types/dashboard'

/**
 * One call for the whole screen. The server composes it from the member,
 * attendance and payment modules, so the six cards, the table and the donut all
 * describe the same instant.
 */
export const dashboardService = {
  summary: () => api.get<DashboardSummary>('/dashboard'),
}
