import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useMember,
  usePlanOptions,
  useRenewMembership,
  useUpdateMembership,
} from '@/features/members/hooks/use-members'
import {
  EMPTY_MEMBERSHIP,
  membershipSchema,
  type MembershipFormValues,
} from '@/features/members/schemas/member.schemas'
import { expiryFor, paymentStatusFor } from '@/features/members/types/member'
import { ROUTES } from '@/constants/routes'

/**
 * The Manage Membership controller — one screen, two modes.
 *
 * Without a `:membershipId` it sells a new membership (renew). With one it
 * edits the agreement already in force: a plan change, an extension, a
 * corrected expiry or discount. Same derivations either way — price from the
 * plan, total after discount — because they are the same arithmetic the server
 * and `v_membership_balance` do.
 *
 * Paid Amount only appears when renewing. On an edit the money is already in
 * the ledger, and the way to change it is Record Payment on the details page,
 * not a rewrite of the row it was taken against.
 */
export function useMembershipForm() {
  const { id, membershipId: membershipIdParam } = useParams<{ id: string; membershipId: string }>()
  const memberId = id ? Number(id) : undefined
  const membershipId = membershipIdParam ? Number(membershipIdParam) : undefined
  const isEdit = membershipId !== undefined

  const navigate = useNavigate()
  const { data: member, isLoading } = useMember(memberId)
  const plans = usePlanOptions()
  const renew = useRenewMembership(memberId)
  const update = useUpdateMembership(memberId, membershipId)

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: EMPTY_MEMBERSHIP,
  })

  const { setValue, watch } = form
  const values = watch()

  const existing = useMemo(
    () => member?.history.find((h) => h.id === membershipId),
    [member, membershipId],
  )

  // Declared here because the reset below needs to set it: loading an existing
  // row counts as an override, or the auto-fill effect would immediately
  // recompute the expiry date the row actually holds.
  const [expiryOverridden, setExpiryOverridden] = useState(false)

  // Populate once the record arrives (edit mode only).
  //
  // The plan options have to be here too, not just the membership row. A native
  // <select> whose value names an <option> that has not rendered yet silently
  // falls back to the first one — so resetting early leaves the field reading
  // "Select Plan" while the form state says otherwise, and only on a client-side
  // navigation, where the member is already cached and the plans are not.
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!existing || !plans.data || loaded) return
    form.reset({
      ...EMPTY_MEMBERSHIP,
      planId: existing.planId,
      startDate: existing.startDate,
      expiryDate: existing.endDate,
      discountAmount: existing.discountAmount,
      planPrice: existing.planPrice,
    })
    setExpiryOverridden(true)
    setLoaded(true)
  }, [existing, plans.data, loaded, form])

  const selectedPlan = useMemo(
    () => plans.data?.find((p) => String(p.id) === String(values.planId)),
    [plans.data, values.planId],
  )

  useEffect(() => {
    setValue('planPrice', selectedPlan?.price ?? 0)
  }, [selectedPlan, setValue])

  useEffect(() => {
    if (expiryOverridden || !selectedPlan || !values.startDate) return
    setValue(
      'expiryDate',
      expiryFor(values.startDate, selectedPlan.durationValue, selectedPlan.durationUnit),
    )
  }, [selectedPlan, values.startDate, expiryOverridden, setValue])

  useEffect(() => {
    if (values.paymentMethod === 'cash' && values.paymentReferenceNo) {
      setValue('paymentReferenceNo', '')
    }
  }, [values.paymentMethod, values.paymentReferenceNo, setValue])

  const price = selectedPlan?.price ?? existing?.planPrice ?? 0
  const discount = Number(values.discountAmount || 0)
  const total = Math.max(0, price - discount)
  // On an edit the paid figure is the ledger's, not the form's.
  const paid = isEdit ? (existing?.paidAmount ?? 0) : Number(values.paidAmount || 0)
  const remaining = Math.max(0, total - paid)

  return {
    form,
    submit: form.handleSubmit((v) => (isEdit ? update.mutate(v) : renew.mutate(v))),
    member,
    existing,
    isEdit,
    // In edit mode the row has to arrive before the form can be filled.
    isLoading: memberId !== undefined && (isLoading || (isEdit && !existing)),
    plans,
    selectedPlan,
    money: { price, discount, total, paid, remaining, status: paymentStatusFor(total, paid) },
    markExpiryOverridden: () => setExpiryOverridden(true),
    saving: isEdit ? update.isPending : renew.isPending,
    memberId,
    membershipId,
    cancel: () => navigate(memberId ? ROUTES.memberDetails(memberId) : ROUTES.MEMBERS),
  }
}
