import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type {
  MembershipPlan,
  MembershipPlanListItem,
  PlanServiceOption,
} from '@/features/membership-plans/types/plan'
import type { PlanFormValues } from '@/features/membership-plans/schemas/plan.schemas'

export interface PlanFilters {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

/**
 * Plans post JSON, not multipart — there is no photo to carry. Empty strings
 * are dropped rather than sent: the server treats "" on a nullable field
 * differently from absent, and we want absent.
 */
function toPayload(values: PlanFormValues) {
  const clean = (v: string | undefined) => {
    const trimmed = v?.trim()
    return trimmed ? trimmed : undefined
  }

  return {
    name: values.name.trim(),
    durationValue: Number(values.durationValue),
    durationUnit: values.durationUnit,
    price: Number(values.price),
    description: clean(values.description),
    planCode: clean(values.planCode),
    serviceIds: values.serviceIds ?? [],
    isActive: values.isActive ?? true,
  }
}

export const planService = {
  list: (filters: PlanFilters = {}) =>
    api.get<PagedResult<MembershipPlanListItem>>('/membership-plans', { params: filters }),

  get: (id: number) => api.get<MembershipPlan>(`/membership-plans/${id}`),

  create: (values: PlanFormValues) =>
    api.post<MembershipPlan>('/membership-plans', toPayload(values)),

  update: (id: number, values: PlanFormValues) =>
    api.put<MembershipPlan>(`/membership-plans/${id}`, toPayload(values)),

  /** Soft delete. `memberships` rows point at the plan, so it is never removed. */
  archive: (id: number) => api.delete(`/membership-plans/${id}`),
}

export const planLookupService = {
  services: () => api.get<PlanServiceOption[]>('/lookups/plan-services'),
}
