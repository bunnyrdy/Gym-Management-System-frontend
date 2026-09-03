import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  planLookupService,
  planService,
  type PlanFilters,
} from '@/features/membership-plans/services/plan.service'
import type { PlanFormValues } from '@/features/membership-plans/schemas/plan.schemas'
import { ROUTES } from '@/constants/routes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'

const keys = {
  all: ['plans'] as const,
  list: (f: PlanFilters) => ['plans', 'list', f] as const,
  detail: (id: number) => ['plans', 'detail', id] as const,
}

function message(err: unknown, fallback: string) {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback
}

export function usePlanList(filters: PlanFilters) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => planService.list(filters).then((r) => r.data),
    // Keeps the previous page on screen while the next one loads, so the table
    // doesn't collapse to a spinner on every keystroke of the search box.
    placeholderData: (prev) => prev,
  })
}

export function usePlan(id: number | undefined) {
  return useQuery({
    queryKey: keys.detail(id!),
    queryFn: () => planService.get(id!).then((r) => r.data),
    enabled: id !== undefined,
  })
}

/**
 * The Included Services catalog. Comes from `plan_services`, not a constant —
 * adding a service is an INSERT, not a deploy. It changes about never, so it is
 * fetched once per session.
 */
export function usePlanServices() {
  return useQuery({
    queryKey: ['lookups', 'plan-services'],
    queryFn: () => planLookupService.services().then((r) => r.data),
    staleTime: Infinity,
  })
}

export function useSavePlan(id?: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (values: PlanFormValues) =>
      id
        ? planService.update(id, values).then((r) => r.data)
        : planService.create(values).then((r) => r.data),

    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: keys.all })
      toast.success(id ? 'Changes saved' : `${saved.name} added as ${saved.planCode}`)
      navigate(ROUTES.PLANS)
    },
    onError: (err) => toast.error(message(err, 'Could not save. Please try again.')),
  })
}

/**
 * Archives rather than deletes. Used from both the list (stay put) and the
 * form (go back to the list), so the caller says where to land.
 */
export function useArchivePlan({ navigateToList = false } = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: number) => planService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all })
      toast.success('Plan archived')
      if (navigateToList) navigate(ROUTES.PLANS)
    },
    onError: (err) => toast.error(message(err, 'Could not archive. Please try again.')),
  })
}
