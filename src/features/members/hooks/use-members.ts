import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  memberLookupService,
  memberService,
  type MemberFilters,
} from '@/features/members/services/member.service'
import type { MemberStatus } from '@/features/members/types/member'
import type {
  MemberFormValues,
  MembershipFormValues,
  PaymentFormValues,
} from '@/features/members/schemas/member.schemas'
import { ROUTES } from '@/constants/routes'
import { keys as dashboardKeys } from '@/features/dashboard/hooks/use-dashboard'
import { keys as paymentKeys } from '@/features/payments/hooks/use-payments'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'

const keys = {
  all: ['members'] as const,
  list: (f: MemberFilters) => ['members', 'list', f] as const,
  stats: ['members', 'stats'] as const,
  detail: (id: number) => ['members', 'detail', id] as const,
}

function message(err: unknown, fallback: string) {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback
}

/**
 * What a member write invalidates.
 *
 * Every one of them moves a dashboard number too: the KPI cards, the donut and
 * the expiring table are all derived from members, so adding, activating,
 * deactivating or paying for one leaves the dashboard reporting the old figures
 * until its staleTime lapses.
 *
 * Both keys are dropped here, at the source, rather than at each call site --
 * there are six mutations below and the seventh would forget. The dashboard is
 * normally unmounted while the user is on a members screen, so this marks it
 * stale and it refetches on the next visit rather than fetching now.
 */
function invalidateMemberViews(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: keys.all })
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
  // Recording a payment from a member's details screen moves the payments page
  // too -- its ledger, its KPI cards and its pending queue are all derived from
  // the same write. The import runs one way: use-payments imports nothing back.
  queryClient.invalidateQueries({ queryKey: paymentKeys.all })
}

/**
 * `enabled` is additive and defaults to on, so every existing caller is
 * unchanged. The payments page needs it: its five tabs read two endpoints, and
 * hooks cannot be called in a branch, so the inactive query is declared and
 * switched off rather than skipped.
 */
export function useMemberList(filters: MemberFilters, enabled = true) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => memberService.list(filters).then((r) => r.data),
    enabled,
    // Keeps the previous page on screen while the next one loads, so the table
    // doesn't collapse to a spinner on every keystroke of the search box.
    placeholderData: (prev) => prev,
  })
}

export function useMemberStats() {
  return useQuery({
    queryKey: keys.stats,
    queryFn: () => memberService.stats().then((r) => r.data),
  })
}

export function useMember(id: number | undefined) {
  return useQuery({
    queryKey: keys.detail(id!),
    queryFn: () => memberService.get(id!).then((r) => r.data),
    enabled: id !== undefined,
  })
}

/**
 * The plan catalog for the form's select. Carries duration and price so the
 * expiry date and membership price fill in without a second round trip.
 */
export function usePlanOptions() {
  return useQuery({
    queryKey: ['lookups', 'plans'],
    queryFn: () => memberLookupService.plans().then((r) => r.data),
    staleTime: Infinity,
  })
}

export function useSaveMember(id?: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({
      values,
      photo,
      removePhoto,
    }: {
      values: MemberFormValues
      photo?: File | null
      removePhoto?: boolean
    }) =>
      id
        ? memberService.update(id, values, photo, removePhoto).then((r) => r.data)
        : memberService.create(values, photo).then((r) => r.data),

    onSuccess: (saved) => {
      invalidateMemberViews(queryClient)
      toast.success(id ? 'Changes saved' : `${saved.fullName} added as ${saved.memberCode}`)
      navigate(ROUTES.memberDetails(saved.id))
    },
    onError: (err) => toast.error(message(err, 'Could not save. Please try again.')),
  })
}

/**
 * Activate / deactivate from the list. Nothing navigates: the row stays where
 * it is and re-renders with its new chip, because deactivating is a correction
 * the user often makes twice in a row.
 */
export function useSetMemberStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: MemberStatus }) =>
      memberService.setStatus(id, status),
    onSuccess: (_data, { status }) => {
      invalidateMemberViews(queryClient)
      toast.success(status === 'active' ? 'Member activated' : 'Member deactivated')
    },
    onError: (err) => toast.error(message(err, 'Could not update status. Please try again.')),
  })
}

/**
 * DPDP erasure. Separate from deactivation on purpose: deactivating is a switch
 * the front desk flips both ways, this overwrites the person, removes them from
 * every list and cannot be undone by anyone.
 */
export function useEraseMember({ navigateToList = false } = {}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: number) => memberService.erase(id),
    onSuccess: () => {
      invalidateMemberViews(queryClient)
      toast.success('Personal data erased')
      if (navigateToList) navigate(ROUTES.MEMBERS)
    },
    onError: (err) => toast.error(message(err, 'Could not erase. Please try again.')),
  })
}

/**
 * Edits the membership in force. Lands back on the details page like renew, so
 * the two paths through Manage Membership end in the same place.
 */
export function useUpdateMembership(memberId: number | undefined, membershipId: number | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (values: MembershipFormValues) =>
      memberService.updateMembership(memberId!, membershipId!, values).then((r) => r.data),
    onSuccess: (saved) => {
      invalidateMemberViews(queryClient)
      toast.success('Membership updated')
      navigate(ROUTES.memberDetails(saved.id))
    },
    onError: (err) => toast.error(message(err, 'Could not update the membership. Please try again.')),
  })
}

/**
 * Records one payment. Stays on the details page — the point of taking a
 * partial payment is to watch the balance move, so navigating away would hide
 * the only thing that changed.
 */
export function useAddPayment(memberId: number | undefined, membershipId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: PaymentFormValues) =>
      memberService.addPayment(memberId!, membershipId!, values).then((r) => r.data),
    onSuccess: () => {
      invalidateMemberViews(queryClient)
      toast.success('Payment recorded')
    },
    onError: (err) => toast.error(message(err, 'Could not record the payment. Please try again.')),
  })
}

export function useRenewMembership(memberId: number | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (values: MembershipFormValues) =>
      memberService.renew(memberId!, values).then((r) => r.data),
    onSuccess: (saved) => {
      invalidateMemberViews(queryClient)
      toast.success(`${saved.fullName} started ${saved.currentMembership?.planName ?? 'a new plan'}`)
      navigate(ROUTES.memberDetails(saved.id))
    },
    onError: (err) => toast.error(message(err, 'Could not save the membership. Please try again.')),
  })
}
