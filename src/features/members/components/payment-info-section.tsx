import { useFormContext } from 'react-hook-form'
import { Wallet } from 'lucide-react'
import { FormSection } from '@/components/ui/form-section'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  MoneyField,
  moneyInput,
  moneyReadOnly,
} from '@/features/members/components/money-field'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  formatPrice,
  type PaymentStatus,
} from '@/features/members/types/member'
import { cn } from '@/utils/cn'
import type { MemberFormValues } from '@/features/members/schemas/member.schemas'

interface Money {
  price: number
  total: number
  remaining: number
  status: PaymentStatus
}

const statusStyles: Record<PaymentStatus, string> = {
  paid: 'border-status-active bg-status-active/10 text-status-active',
  partial: 'border-status-pending bg-status-pending/10 text-status-pending',
  pending: 'border-status-expired bg-status-expired/10 text-status-expired',
}

/**
 * Payment Info.
 *
 * Only Discount and Paid Amount are typed. Price comes from the plan, Total is
 * price − discount, Remaining is total − paid, and the status chip is the same
 * three-way rule `v_membership_balance` applies — so the screen, the API and
 * the database always agree. Making the chip clickable would let a member show
 * "Paid" while owing money.
 */
export function PaymentInfoSection({ money, readOnly = false }: { money: Money; readOnly?: boolean }) {
  const { register, watch, formState: { errors } } = useFormContext<MemberFormValues>()
  const isCash = watch('paymentMethod') === 'cash'

  return (
    <FormSection title="Payment Info" icon={Wallet}>
      <div className="mb-md grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
        <MoneyField label="Membership Price" htmlFor="membershipPrice">
          <Input
            id="membershipPrice"
            readOnly
            tabIndex={-1}
            className={moneyReadOnly}
            value={formatPrice(money.price)}
          />
        </MoneyField>

        <MoneyField label="Discount" htmlFor="discountAmount" error={errors.discountAmount?.message}>
          <Input
            id="discountAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={readOnly}
            error={!!errors.discountAmount}
            className={moneyInput}
            {...register('discountAmount')}
          />
        </MoneyField>

        <MoneyField label="Total Amount" htmlFor="totalAmount">
          <Input
            id="totalAmount"
            readOnly
            tabIndex={-1}
            className={moneyReadOnly}
            value={formatPrice(money.total)}
          />
        </MoneyField>
      </div>

      <div className="mb-md grid grid-cols-1 gap-md border-t border-surface-container pt-md md:grid-cols-2 xl:grid-cols-3">
        <MoneyField label="Paid Amount" htmlFor="paidAmount" error={errors.paidAmount?.message}>
          <Input
            id="paidAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={readOnly}
            error={!!errors.paidAmount}
            className={moneyInput}
            {...register('paidAmount')}
          />
        </MoneyField>

        <MoneyField label="Remaining Balance" htmlFor="remainingBalance">
          <Input
            id="remainingBalance"
            readOnly
            tabIndex={-1}
            className={moneyReadOnly}
            value={formatPrice(money.remaining)}
          />
        </MoneyField>

        <FormField label="Payment Status" htmlFor="paymentStatus">
          {/* Derived, so it is shown rather than chosen. */}
          <div id="paymentStatus" className="flex flex-wrap gap-1.5 pt-1" role="status" aria-live="polite">
            {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((key) => (
              <span
                key={key}
                className={cn(
                  // min-w-0 undoes the flex item's automatic content floor;
                  // basis-20 keeps the three chips on one line where there is
                  // room and lets them wrap to two rather than overflow where
                  // there is not.
                  'min-w-0 flex-1 basis-20 rounded-md border px-2 py-2 text-center font-mono text-label-sm transition-colors',
                  key === money.status
                    ? statusStyles[key]
                    : 'border-surface-container-high bg-surface-container-lowest text-on-surface-variant',
                )}
              >
                {PAYMENT_STATUS_LABELS[key]}
              </span>
            ))}
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <FormField label="Payment Method" htmlFor="paymentMethod" error={errors.paymentMethod?.message}>
          <Select
            id="paymentMethod"
            disabled={readOnly}
            error={!!errors.paymentMethod}
            {...register('paymentMethod')}
          >
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </FormField>

        {/* Cash has no transaction to reference, so the field is not merely
            disabled — it is gone, and its value cleared. A greyed-out box still
            invites the question of what belongs in it. */}
        {!isCash && (
          <FormField
            label="Payment Reference No."
            htmlFor="paymentReferenceNo"
            error={errors.paymentReferenceNo?.message}
          >
            <Input
              id="paymentReferenceNo"
              placeholder="e.g. TXN123456"
              disabled={readOnly}
              error={!!errors.paymentReferenceNo}
              {...register('paymentReferenceNo')}
            />
          </FormField>
        )}
      </div>
    </FormSection>
  )
}
