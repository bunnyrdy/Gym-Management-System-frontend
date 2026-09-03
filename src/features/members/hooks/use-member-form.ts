import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useEraseMember,
  useMember,
  usePlanOptions,
  useSaveMember,
} from '@/features/members/hooks/use-members'
import {
  EMPTY_MEMBER,
  memberSchema,
  type MemberFormValues,
} from '@/features/members/schemas/member.schemas'
import { expiryFor, paymentStatusFor } from '@/features/members/types/member'
import { ROUTES } from '@/constants/routes'

/**
 * The Add / Edit Member controller: load the record, map it into form values,
 * track the photo, wire save/erase, and derive the money.
 *
 * The four money figures are computed here rather than typed. The plan owns the
 * price, the discount comes off it, and the balance falls out of what has been
 * paid — the same arithmetic the server does and `v_membership_balance` does,
 * so the three can never show different numbers.
 */
export function useMemberForm() {
  const { id } = useParams<{ id: string }>()
  const memberId = id ? Number(id) : undefined
  const isEdit = memberId !== undefined

  const navigate = useNavigate()
  const { data: existing, isLoading } = useMember(memberId)
  const plans = usePlanOptions()
  const save = useSaveMember(memberId)
  const erase = useEraseMember({ navigateToList: true })

  const [photo, setPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: EMPTY_MEMBER,
  })

  const { setValue, watch } = form
  const values = watch()

  // Populate once the record arrives (edit mode only).
  useEffect(() => {
    if (!existing) return
    form.reset({
      fullName: existing.fullName,
      phone: existing.phone,
      email: existing.email ?? '',
      gender: (existing.gender ?? '') as MemberFormValues['gender'],
      dateOfBirth: existing.dateOfBirth ?? '',
      address: existing.address ?? '',
      emergencyContactName: existing.emergencyContactName ?? '',
      emergencyContactPhone: existing.emergencyContactPhone ?? '',
      status: existing.status,
      marketingOptIn: existing.marketingOptIn,
      notes: existing.notes ?? '',
      planId: existing.currentMembership?.planId ?? '',
      joiningDate: existing.joinedOn,
      expiryDate: existing.currentMembership?.endDate ?? '',
      discountAmount: existing.currentMembership?.discountAmount ?? '',
      paidAmount: existing.currentMembership?.paidAmount ?? '',
      paymentMethod: 'cash',
      paymentReferenceNo: '',
      planPrice: existing.currentMembership?.planPrice ?? 0,
      isEdit: true,
    })
  }, [existing, form])

  const selectedPlan = useMemo(
    () => plans.data?.find((p) => String(p.id) === String(values.planId)),
    [plans.data, values.planId],
  )

  // Price lives on the plan. It is mirrored into the form only so the schema's
  // discount rule can see it; the server reads the real one before selling.
  useEffect(() => {
    if (isEdit) return
    setValue('planPrice', selectedPlan?.price ?? 0)
  }, [selectedPlan, isEdit, setValue])

  // Expiry follows the plan and the joining date until the user overrides it.
  const [expiryOverridden, setExpiryOverridden] = useState(false)
  useEffect(() => {
    if (isEdit || expiryOverridden || !selectedPlan || !values.joiningDate) return
    setValue(
      'expiryDate',
      expiryFor(values.joiningDate, selectedPlan.durationValue, selectedPlan.durationUnit),
    )
  }, [selectedPlan, values.joiningDate, expiryOverridden, isEdit, setValue])

  // A stale reference must never reach the server when the method is cash.
  useEffect(() => {
    if (values.paymentMethod === 'cash' && values.paymentReferenceNo) {
      setValue('paymentReferenceNo', '')
    }
  }, [values.paymentMethod, values.paymentReferenceNo, setValue])

  const price = selectedPlan?.price ?? existing?.currentMembership?.planPrice ?? 0
  const discount = Number(values.discountAmount || 0)
  const total = Math.max(0, price - discount)
  const paid = Number(values.paidAmount || 0)
  const remaining = Math.max(0, total - paid)

  const submit = form.handleSubmit((v) => save.mutate({ values: v, photo, removePhoto }))

  return {
    form,
    submit,
    existing,
    isEdit,
    isLoading: isEdit && isLoading,
    plans,
    selectedPlan,
    money: {
      price,
      discount,
      total,
      paid,
      remaining,
      status: paymentStatusFor(total, paid),
    },
    markExpiryOverridden: () => setExpiryOverridden(true),
    saving: save.isPending,
    // Nothing to save until a field, or the photo, actually changed.
    saveDisabled: isEdit && !form.formState.isDirty && !photo && !removePhoto,
    onPhotoChange: (file: File | null, removed: boolean) => {
      setPhoto(file)
      setRemovePhoto(removed)
    },
    photoUrl: removePhoto ? null : (existing?.photoUrl ?? null),
    erase,
    memberId,
    cancel: () => navigate(isEdit ? ROUTES.memberDetails(memberId!) : ROUTES.MEMBERS),
  }
}
