import { useFormContext } from 'react-hook-form'
import { CreditCard, Pencil } from 'lucide-react'
import { FormSection } from '@/components/ui/form-section'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { durationLabel, formatPrice, type PlanOption } from '@/features/members/types/member'
import { CURRENCY_SYMBOL } from '@/utils/currency'
import type { MemberFormValues } from '@/features/members/schemas/member.schemas'

/**
 * Membership Info. Duration is read-only because it belongs to the plan, and
 * expiry fills itself in from the plan's duration until the user clicks the
 * pencil — the design's "Override Date" affordance.
 *
 * On edit the whole section is read-only: changing what somebody bought writes
 * a new dated row through Renew, so that a receipt already handed over stays
 * reproducible.
 */
export function MembershipInfoSection({
  plans,
  selectedPlan,
  readOnly = false,
  onExpiryOverride,
}: {
  plans: PlanOption[]
  selectedPlan?: PlanOption
  readOnly?: boolean
  onExpiryOverride: () => void
}) {
  const { register, formState: { errors } } = useFormContext<MemberFormValues>()

  return (
    <FormSection title="Membership Info" icon={CreditCard}>
      {readOnly && (
        <p className="mb-md rounded-md bg-surface-container-low px-sm py-2 text-label-sm text-on-surface-variant">
          A membership is a dated record. Use <span className="font-bold">Renew / New</span> on the
          member's page to change the plan or take another payment.
        </p>
      )}

      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        <FormField label="Membership Plan *" htmlFor="planId" error={errors.planId?.message}>
          <Select id="planId" disabled={readOnly} error={!!errors.planId} {...register('planId')}>
            <option value="">Select a Plan</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {durationLabel(p.durationValue, p.durationUnit)} ({CURRENCY_SYMBOL}
                {formatPrice(p.price)})
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Joining Date *" htmlFor="joiningDate" error={errors.joiningDate?.message}>
          <Input
            id="joiningDate"
            type="date"
            error={!!errors.joiningDate}
            {...register('joiningDate')}
          />
        </FormField>

        <FormField label="Duration" htmlFor="duration">
          <Input
            id="duration"
            readOnly
            tabIndex={-1}
            className="cursor-not-allowed border-transparent bg-surface-container text-on-surface-variant"
            value={
              selectedPlan
                ? durationLabel(selectedPlan.durationValue, selectedPlan.durationUnit)
                : '—'
            }
          />
        </FormField>

        <FormField
          label="Expiry Date"
          htmlFor="expiryDate"
          error={errors.expiryDate?.message}
          labelRight={
            !readOnly && (
              <button
                type="button"
                onClick={onExpiryOverride}
                className="flex items-center gap-1 font-mono text-label-sm text-on-surface-variant hover:text-primary-container"
                title="Set the expiry date by hand"
              >
                <Pencil className="h-3 w-3" aria-hidden /> Override
              </button>
            )
          }
        >
          <Input
            id="expiryDate"
            type="date"
            disabled={readOnly}
            error={!!errors.expiryDate}
            {...register('expiryDate')}
          />
        </FormField>
      </div>

      {!readOnly && (
        <p className="mt-sm text-label-sm text-on-surface-variant">
          Calculated automatically from the plan's duration — one full period, ending the day
          before it would repeat.
        </p>
      )}
    </FormSection>
  )
}
