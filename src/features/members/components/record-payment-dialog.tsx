import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MoneyField, moneyInput } from '@/features/members/components/money-field'
import { useAddPayment } from '@/features/members/hooks/use-members'
import {
  EMPTY_PAYMENT,
  paymentSchema,
  type PaymentFormValues,
} from '@/features/members/schemas/member.schemas'
import { PAYMENT_METHOD_LABELS, formatPrice } from '@/features/members/types/member'
import { formatMoney } from '@/utils/currency'

/**
 * Takes one payment against the membership in force — the partial-payment flow.
 *
 * A dialog rather than a screen: it is a single POST, and the whole reason for
 * recording a part payment is to watch the balance move, which a navigation
 * away would hide. Native `<dialog>` for the same reason as ConfirmDialog —
 * the focus trap, Escape handling and inert background come free.
 */
export function RecordPaymentDialog({
  open,
  memberId,
  membershipId,
  outstanding,
  onClose,
}: {
  open: boolean
  memberId: number
  membershipId: number
  outstanding: number
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const addPayment = useAddPayment(memberId, membershipId)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: EMPTY_PAYMENT,
  })

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = form
  const isCash = watch('method') === 'cash'

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      reset(EMPTY_PAYMENT)
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open, reset])

  // A stale reference must never reach the server when the method is cash.
  useEffect(() => {
    if (isCash) setValue('referenceNo', '')
  }, [isCash, setValue])

  const submit = handleSubmit((values) => {
    // The ceiling is the ledger's, not the form's, so it is checked here and
    // again on the server against the payments actually recorded.
    if (Number(values.amount) > outstanding) {
      form.setError('amount', {
        message: `That is more than the ${formatMoney(outstanding)} outstanding.`,
      })
      return
    }
    addPayment.mutate(values, { onSuccess: onClose })
  })

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(92vw,460px)] rounded-md bg-surface-container-lowest p-md text-on-surface shadow-defined-lift backdrop:bg-inverse-surface/40"
    >
      <h2 className="mb-xs text-headline-md text-on-surface">Record Payment</h2>
      <p className="mb-md text-body-md text-on-surface-variant">
        {formatMoney(outstanding)} outstanding on this membership.
      </p>

      <div className="space-y-md">
        <MoneyField label="Amount" htmlFor="amount" error={errors.amount?.message}>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder={formatPrice(outstanding)}
            error={!!errors.amount}
            className={moneyInput}
            {...register('amount')}
          />
        </MoneyField>

        <FormField label="Payment Method" htmlFor="method" error={errors.method?.message}>
          <Select id="method" error={!!errors.method} {...register('method')}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FormField>

        {/* Cash has no transaction to reference. */}
        {!isCash && (
          <FormField
            label="Payment Reference No."
            htmlFor="referenceNo"
            error={errors.referenceNo?.message}
          >
            <Input
              id="referenceNo"
              placeholder="e.g. TXN123456"
              error={!!errors.referenceNo}
              {...register('referenceNo')}
            />
          </FormField>
        )}

        <FormField label="Notes" htmlFor="paymentNotes" error={errors.notes?.message}>
          <Textarea id="paymentNotes" rows={2} error={!!errors.notes} {...register('notes')} />
        </FormField>
      </div>

      <div className="mt-lg flex justify-end gap-sm">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" size="sm" loading={addPayment.isPending} onClick={submit}>
          Record Payment
        </Button>
      </div>
    </dialog>
  )
}
