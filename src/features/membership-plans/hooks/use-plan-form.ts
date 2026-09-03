import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useArchivePlan,
  usePlan,
  usePlanServices,
  useSavePlan,
} from '@/features/membership-plans/hooks/use-plans'
import {
  EMPTY_PLAN,
  planSchema,
  type PlanFormValues,
} from '@/features/membership-plans/schemas/plan.schemas'
import { ROUTES } from '@/constants/routes'

/**
 * The Add / Edit Plan controller: load the record, map it into form values,
 * fetch the services catalog, wire save/archive, and expose the derived state
 * the header needs. The page is then just its sections plus the preview.
 */
export function usePlanForm() {
  const { id } = useParams<{ id: string }>()
  const planId = id ? Number(id) : undefined
  const isEdit = planId !== undefined

  const navigate = useNavigate()
  const { data: existing, isLoading } = usePlan(planId)
  const services = usePlanServices()
  const save = useSavePlan(planId)
  const archive = useArchivePlan({ navigateToList: true })

  const [confirmingArchive, setConfirmingArchive] = useState(false)

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: EMPTY_PLAN,
  })

  // Populate once the record arrives (edit mode only).
  useEffect(() => {
    if (!existing) return
    form.reset({
      name: existing.name,
      durationValue: existing.durationValue,
      durationUnit: existing.durationUnit,
      price: existing.price,
      description: existing.description ?? '',
      serviceIds: existing.services.map((s) => s.id),
      planCode: existing.planCode ?? '',
      isActive: existing.isActive,
    })
  }, [existing, form])

  const submit = form.handleSubmit((values) => save.mutate(values))

  return {
    form,
    submit,
    existing,
    isEdit,
    isLoading: isEdit && isLoading,
    services,
    saving: save.isPending,
    // Nothing to save until a field actually changed.
    saveDisabled: isEdit && !form.formState.isDirty,
    confirmingArchive,
    setConfirmingArchive,
    archive,
    planId,
    cancel: () => navigate(ROUTES.PLANS),
  }
}
