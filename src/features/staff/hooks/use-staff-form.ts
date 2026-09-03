import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useDeleteStaff,
  useEraseStaff,
  useSaveStaff,
  useStaffLookups,
  useStaffMember,
} from '@/features/staff/hooks/use-staff'
import {
  EMPTY_STAFF,
  staffSchema,
  type StaffFormValues,
} from '@/features/staff/schemas/staff.schemas'
import { hhmm, type StaffRole } from '@/features/staff/types/staff'

/**
 * Everything the two staff forms do identically: load the record, map it into
 * form values, track the photo, wire save/delete, and expose the derived state
 * the header needs. Each page is then just its own sections plus a summary.
 */
export function useStaffForm(role: StaffRole, listRoute: string) {
  const { id } = useParams<{ id: string }>()
  const staffId = id ? Number(id) : undefined
  const isEdit = staffId !== undefined

  const navigate = useNavigate()
  const { data: existing, isLoading } = useStaffMember(role, staffId)
  const lookups = useStaffLookups()
  // Saving lands on the details page, not the list — same as members. The
  // list route is still what Cancel goes back to.
  const save = useSaveStaff(role, staffId)
  const remove = useDeleteStaff(role, listRoute)
  const erase = useEraseStaff(role, listRoute)

  const [photo, setPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: EMPTY_STAFF,
  })

  // Populate once the record arrives (edit mode only).
  useEffect(() => {
    if (!existing) return
    form.reset({
      fullName: existing.fullName,
      gender: existing.gender ?? '',
      dateOfBirth: existing.dateOfBirth ?? '',
      phone: existing.phone,
      email: existing.email ?? '',
      address: existing.address ?? '',
      emergencyContactName: existing.emergencyContactName ?? '',
      emergencyContactPhone: existing.emergencyContactPhone ?? '',
      jobTitle: existing.jobTitle ?? '',
      specialization: existing.specialization ?? '',
      qualifications: existing.qualifications.join(', '),
      experienceYears: existing.experienceYears ?? '',
      joiningDate: existing.joiningDate,
      status: existing.status,
      notes: existing.notes ?? '',
      shiftId: existing.shift?.shiftId ?? '',
      customStartTime: hhmm(existing.shift?.startTime) ?? '',
      customEndTime: hhmm(existing.shift?.endTime) ?? '',
      workingDays: existing.shift?.workingDays ?? [],
      responsibilityTagIds: existing.responsibilities.map((t) => t.id),
    })
  }, [existing, form])

  const onPhotoChange = (file: File | null, removed: boolean) => {
    setPhoto(file)
    setRemovePhoto(removed)
  }

  const submit = form.handleSubmit((values) => save.mutate({ values, photo, removePhoto }))

  return {
    form,
    submit,
    existing,
    isEdit,
    isLoading: isEdit && isLoading,
    lookups,
    saving: save.isPending,
    // Nothing to save until a field, or the photo, actually changed.
    saveDisabled: isEdit && !form.formState.isDirty && !photo && !removePhoto,
    onPhotoChange,
    photoUrl: removePhoto ? null : (existing?.photoUrl ?? null),
    confirmingDelete,
    setConfirmingDelete,
    remove,
    erase,
    staffId,
    cancel: () => navigate(listRoute),
  }
}
