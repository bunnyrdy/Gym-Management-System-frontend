import { Link } from 'react-router-dom'
import { Dumbbell, FileText, Receipt } from 'lucide-react'
import { useMembershipForm } from '@/features/members/hooks/use-membership-form'
import { MemberStatusChip } from '@/features/members/components/member-status-chip'
import { MoneyField, moneyInput, moneyReadOnly } from '@/features/members/components/money-field'
import { FormSection } from '@/components/ui/form-section'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/common/alert'
import {
  PAYMENT_METHOD_LABELS,
  durationLabel,
  formatDate,
  formatPrice,
} from '@/features/members/types/member'
import { CURRENCY_SYMBOL } from '@/utils/currency'
import { ROUTES } from '@/constants/routes'

/**
 * Manage Membership — the Renew / New screen.
 *
 * Every renewal is a new dated row, never an edit of the last one. That is what
 * makes the history table on the detail screen possible, and it is why the
 * price is snapshotted server-side rather than looked up when a receipt is
 * printed.
 */
export default function MembershipFormPage() {
  const s = useMembershipForm()
  const { register, formState: { errors } } = s.form
  const isCash = s.form.watch('paymentMethod') === 'cash'

  if (s.isLoading) {
    return (
      <div className="flex justify-center py-xl">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  if (!s.member) {
    return <Alert variant="error">Could not load this member.</Alert>
  }

  return (
    <form onSubmit={s.submit} noValidate>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <div className="flex items-center gap-md">
          <Avatar
            name={s.member.fullName}
            src={s.member.photoUrl}
            className="h-14 w-14 text-label-md"
          />
          <div>
            <nav className="mb-1 font-mono text-label-sm text-on-surface-variant" aria-label="Breadcrumb">
              <Link to={ROUTES.memberDetails(s.member.id)} className="transition-colors hover:text-primary">
                {s.member.fullName}
              </Link>
              <span className="mx-1">/</span>
              <span className="text-on-surface">{s.isEdit ? 'Edit Membership' : 'New Membership'}</span>
            </nav>
            <h1 className="text-headline-lg text-on-background">
              {s.isEdit ? 'Edit Membership' : 'Manage Membership'}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-label-sm text-on-surface-variant">
              ID: {s.member.memberCode} · Member since {formatDate(s.member.joinedOn)}
              <MemberStatusChip status={s.member.status} />
            </p>
          </div>
        </div>

        <div className="flex gap-sm">
          <Button type="button" variant="secondary" size="sm" onClick={s.cancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={s.saving}>
            {s.isEdit ? 'Save Changes' : 'Save Membership'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-lg lg:grid-cols-12">
        <div className="flex flex-col gap-lg lg:col-span-8">
          <FormSection title="Plan Details" icon={Dumbbell}>
            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              <FormField label="Membership Plan *" htmlFor="planId" error={errors.planId?.message}>
                <Select id="planId" error={!!errors.planId} {...register('planId')}>
                  <option value="">Select Plan</option>
                  {(s.plans.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {durationLabel(p.durationValue, p.durationUnit)} ({CURRENCY_SYMBOL}
                      {formatPrice(p.price)})
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Duration (Auto)" htmlFor="duration">
                <Input
                  id="duration"
                  readOnly
                  tabIndex={-1}
                  className="cursor-not-allowed border-transparent bg-surface-container text-on-surface-variant"
                  value={
                    s.selectedPlan
                      ? durationLabel(s.selectedPlan.durationValue, s.selectedPlan.durationUnit)
                      : '—'
                  }
                />
              </FormField>

              <FormField label="Start Date *" htmlFor="startDate" error={errors.startDate?.message}>
                <Input id="startDate" type="date" error={!!errors.startDate} {...register('startDate')} />
              </FormField>

              <FormField
                label="Expiry Date (Calc)"
                htmlFor="expiryDate"
                error={errors.expiryDate?.message}
                labelRight={
                  <button
                    type="button"
                    onClick={s.markExpiryOverridden}
                    className="font-mono text-label-sm text-on-surface-variant hover:text-primary-container"
                  >
                    Override
                  </button>
                }
              >
                <Input id="expiryDate" type="date" error={!!errors.expiryDate} {...register('expiryDate')} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Additional Notes" icon={FileText}>
            <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
              <Textarea
                id="notes"
                rows={4}
                placeholder="Any special requests, medical notes or staff comments…"
                error={!!errors.notes}
                {...register('notes')}
              />
            </FormField>
          </FormSection>
        </div>

        {/* Billing Summary */}
        <aside className="lg:sticky lg:top-[100px] lg:col-span-4">
          <div className="card-surface overflow-hidden border border-surface-container-highest shadow-defined-lift">
            <header className="flex items-center gap-sm border-b border-surface-container px-md py-sm">
              <Receipt className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-headline-md text-on-surface">Billing Summary</h2>
            </header>

            <div className="space-y-md p-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-label-md text-on-surface-variant">Base Price</span>
                <span className="font-mono text-headline-md font-bold text-on-surface">
                  {CURRENCY_SYMBOL}{formatPrice(s.money.price)}
                </span>
              </div>

              <MoneyField
                label="Discount applied"
                htmlFor="discountAmount"
                error={errors.discountAmount?.message}
              >
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  error={!!errors.discountAmount}
                  className={moneyInput}
                  {...register('discountAmount')}
                />
              </MoneyField>

              <div className="flex items-center justify-between border-t border-surface-container pt-md">
                <span className="text-headline-md text-on-surface">Final Amount</span>
                <span className="text-headline-lg font-bold text-primary-container">
                  <span className="text-headline-md">{CURRENCY_SYMBOL}</span>
                  {formatPrice(s.money.total)}
                </span>
              </div>

              {!s.isEdit && (
                <FormField
                  label="Payment Method"
                  htmlFor="paymentMethod"
                  error={errors.paymentMethod?.message}
                >
                  <Select id="paymentMethod" error={!!errors.paymentMethod} {...register('paymentMethod')}>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </FormField>
              )}

              {/* Cash has no transaction id, so the field is absent rather than
                  greyed out — and its value is cleared when the method changes. */}
              {!s.isEdit && !isCash && (
                <FormField
                  label="Payment Reference No."
                  htmlFor="paymentReferenceNo"
                  error={errors.paymentReferenceNo?.message}
                >
                  <Input
                    id="paymentReferenceNo"
                    placeholder="e.g. TXN123456"
                    error={!!errors.paymentReferenceNo}
                    {...register('paymentReferenceNo')}
                  />
                </FormField>
              )}

              <div className="grid grid-cols-2 gap-sm">
                {/* Editing never takes money. What has been collected is a
                    ledger fact; another payment is Record Payment on the
                    details page, which adds a row rather than rewriting one. */}
                <MoneyField label="Paid Amount" htmlFor="paidAmount" error={errors.paidAmount?.message}>
                  {s.isEdit ? (
                    <Input
                      id="paidAmount"
                      readOnly
                      tabIndex={-1}
                      className={moneyReadOnly}
                      value={formatPrice(s.money.paid)}
                    />
                  ) : (
                    <Input
                      id="paidAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      error={!!errors.paidAmount}
                      className={moneyInput}
                      {...register('paidAmount')}
                    />
                  )}
                </MoneyField>

                <MoneyField label="Balance" htmlFor="balance">
                  <Input
                    id="balance"
                    readOnly
                    tabIndex={-1}
                    className={moneyReadOnly}
                    value={formatPrice(s.money.remaining)}
                  />
                </MoneyField>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}
