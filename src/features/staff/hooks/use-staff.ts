import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  lookupService,
  staffService,
  type StaffFilters,
} from '@/features/staff/services/staff.service'
import type { StaffFormValues } from '@/features/staff/schemas/staff.schemas'
import type { StaffRole } from '@/features/staff/types/staff'
import { ROUTES } from '@/constants/routes'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'

const keys = {
  all: (role: StaffRole) => [role] as const,
  list: (role: StaffRole, f: StaffFilters) => [role, 'list', f] as const,
  detail: (role: StaffRole, id: number) => [role, 'detail', id] as const,
  stats: (role: StaffRole) => [role, 'stats'] as const,
}

function message(err: unknown, fallback: string) {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback
}

export function useStaffList(role: StaffRole, filters: StaffFilters) {
  return useQuery({
    queryKey: keys.list(role, filters),
    queryFn: () => staffService(role).list(filters).then((r) => r.data),
    // Keeps the previous page on screen while the next one loads, so the table
    // doesn't collapse to a spinner on every keystroke of the search box.
    placeholderData: (prev) => prev,
  })
}

export function useStaffStats(role: StaffRole) {
  return useQuery({
    queryKey: keys.stats(role),
    queryFn: () => staffService(role).stats().then((r) => r.data),
  })
}

export function useStaffMember(role: StaffRole, id: number | undefined) {
  return useQuery({
    queryKey: keys.detail(role, id!),
    queryFn: () => staffService(role).get(id!).then((r) => r.data),
    enabled: id !== undefined,
  })
}

/** Shift, responsibility and specialization options. Rarely change — cached for the session. */
export function useStaffLookups() {
  const shifts = useQuery({
    queryKey: ['lookups', 'shifts'],
    queryFn: () => lookupService.shifts().then((r) => r.data),
    staleTime: Infinity,
  })
  const responsibilities = useQuery({
    queryKey: ['lookups', 'responsibilities'],
    queryFn: () => lookupService.responsibilities().then((r) => r.data),
    staleTime: Infinity,
  })
  const specializations = useQuery({
    queryKey: ['lookups', 'specializations'],
    queryFn: () => lookupService.specializations().then((r) => r.data),
    staleTime: Infinity,
  })
  return { shifts, responsibilities, specializations }
}

/** `/staff/trainers/4` — the details screen, not the form at `/4/edit`. */
function detailsRoute(role: StaffRole, id: number) {
  return role === 'trainers' ? ROUTES.trainerDetails(id) : ROUTES.receptionistDetails(id)
}

export function useSaveStaff(role: StaffRole, id?: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({
      values,
      photo,
      removePhoto,
    }: {
      values: StaffFormValues
      photo?: File | null
      removePhoto?: boolean
    }) =>
      id
        ? staffService(role).update(id, values, photo, removePhoto).then((r) => r.data)
        : staffService(role).create(values, photo).then((r) => r.data),

    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: keys.all(role) })
      toast.success(id ? 'Changes saved' : `${saved.fullName} added as ${saved.staffCode}`)
      navigate(detailsRoute(role, saved.id))
    },
    onError: (err) => toast.error(message(err, 'Could not save. Please try again.')),
  })
}

export function useDeleteStaff(role: StaffRole, listRoute: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: number) => staffService(role).remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all(role) })
      toast.success('Removed')
      navigate(listRoute)
    },
    onError: (err) => toast.error(message(err, 'Could not remove. Please try again.')),
  })
}

/**
 * DPDP erasure. Separate from delete on purpose: delete hides a row and a DBA
 * can undo it, this overwrites the person and nobody can.
 */
export function useEraseStaff(role: StaffRole, listRoute: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: number) => staffService(role).erase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all(role) })
      toast.success('Personal data erased')
      navigate(listRoute)
    },
    onError: (err) => toast.error(message(err, 'Could not erase. Please try again.')),
  })
}
