import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type {
  StaffListItem,
  StaffMember,
  StaffRole,
  StaffStats,
  ShiftOption,
  TagOption,
} from '@/features/staff/types/staff'
import type { StaffFormValues } from '@/features/staff/schemas/staff.schemas'

export interface StaffFilters {
  search?: string
  status?: string
  gender?: string
  shiftId?: number
  page?: number
  pageSize?: number
}

/**
 * The API takes multipart/form-data so the photo travels with the fields.
 * Empty strings are dropped rather than sent — the server treats "" on a
 * nullable field differently from absent, and we want absent.
 */
function toFormData(
  values: StaffFormValues,
  photo?: File | null,
  removePhoto?: boolean,
): FormData {
  const fd = new FormData()

  const put = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return
    fd.append(key, String(value))
  }

  put('FullName', values.fullName)
  put('Gender', values.gender)
  put('DateOfBirth', values.dateOfBirth)
  put('Phone', values.phone)
  put('Email', values.email)
  put('Address', values.address)
  put('EmergencyContactName', values.emergencyContactName)
  put('EmergencyContactPhone', values.emergencyContactPhone)
  put('JobTitle', values.jobTitle)
  put('Specialization', values.specialization)
  put('ExperienceYears', values.experienceYears)
  put('JoiningDate', values.joiningDate)
  put('Status', values.status)
  put('Notes', values.notes)
  put('ShiftId', values.shiftId)
  put('CustomStartTime', values.customStartTime)
  put('CustomEndTime', values.customEndTime)

  // "NSCA-CSCS, CPR/AED" -> repeated Qualifications keys.
  ;(values.qualifications ?? '')
    .split(',')
    .map((q) => q.trim())
    .filter(Boolean)
    .forEach((q) => fd.append('Qualifications', q))

  // Repeated keys — how ASP.NET binds an array from form data.
  values.workingDays?.forEach((d) => fd.append('WorkingDays', String(d)))
  values.responsibilityTagIds?.forEach((id) => fd.append('ResponsibilityTagIds', String(id)))

  if (photo) fd.append('photo', photo)
  if (removePhoto) fd.append('removePhoto', 'true')

  return fd
}

/**
 * One client, parameterised by role. `/api/receptionists` and `/api/trainers`
 * are the same endpoints behind the same shapes, so there is one implementation.
 */
export function staffService(role: StaffRole) {
  const base = `/${role}`
  return {
    list: (filters: StaffFilters = {}) =>
      api.get<PagedResult<StaffListItem>>(base, { params: filters }),

    get: (id: number) => api.get<StaffMember>(`${base}/${id}`),

    create: (values: StaffFormValues, photo?: File | null) =>
      api.post<StaffMember>(base, toFormData(values, photo)),

    update: (id: number, values: StaffFormValues, photo?: File | null, removePhoto?: boolean) =>
      api.put<StaffMember>(`${base}/${id}`, toFormData(values, photo, removePhoto)),

    stats: () => api.get<StaffStats>(`${base}/stats`),

    /** Soft delete. Attendance and PT rows reference this person, so it is hidden, not removed. */
    remove: (id: number) => api.delete(`${base}/${id}`),

    /** DPDP erasure. Irreversible — personal data is overwritten in place. */
    erase: (id: number) => api.post(`${base}/${id}/erase`),
  }
}

export const lookupService = {
  shifts: () => api.get<ShiftOption[]>('/lookups/shifts'),
  responsibilities: () => api.get<TagOption[]>('/lookups/responsibilities'),
  specializations: () => api.get<TagOption[]>('/lookups/specializations'),
}
