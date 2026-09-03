import { Controller, FormProvider } from 'react-hook-form'
import { Info, ListChecks, Settings2 } from 'lucide-react'
import { usePlanForm } from '@/features/membership-plans/hooks/use-plan-form'
import { ServicesPicker } from '@/features/membership-plans/components/services-picker'
import { PlanSummaryPanel } from '@/features/membership-plans/components/plan-summary-panel'
import type { DurationUnit } from '@/features/membership-plans/types/plan'
import { FormSection } from '@/components/ui/form-section'
import { DangerZone } from '@/components/ui/danger-zone'
import { FormHeader, FormLayout, FormColumn } from '@/components/ui/form-shell'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ROUTES } from '@/constants/routes'
import { CURRENCY_SYMBOL } from '@/utils/currency'

export default function PlanFormPage() {
  const s = usePlanForm()
  const { register, control, watch, formState: { errors } } = s.form
  const values = watch()

  const catalog = s.services.data ?? []
  // The preview lists names, the form holds ids — resolve through the catalog
  // so both stay in the order the API returned.
  const chosen = catalog.filter((option) => (values.serviceIds ?? []).includes(option.id))

  if (s.isLoading)
    return <div className="grid min-h-[50vh] place-items-center"><Spinner size="lg" className="text-primary-container" /></div>

  return (
    <FormProvider {...s.form}>
      <form onSubmit={s.submit} noValidate>
        <FormHeader
          listLabel="Membership Plans"
          listRoute={ROUTES.PLANS}
          title={s.isEdit ? 'Edit Membership Plan' : 'Add Membership Plan'}
          isEdit={s.isEdit}
          saving={s.saving}
          saveDisabled={s.saveDisabled}
          onCancel={s.cancel}
          saveLabel={s.isEdit ? 'Save Changes' : 'Save Plan'}
        />

        <FormLayout>
          <FormColumn>
            <FormSection title="Plan Information" icon={Info}>
              <div className="grid grid-cols-1 gap-md">
                <FormField label="Plan Name *" htmlFor="name" error={errors.name?.message}>
                  <Input
                    id="name"
                    placeholder="Elite Annual Membership"
                    error={!!errors.name}
                    {...register('name')}
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                  <FormField
                    label="Duration *"
                    htmlFor="durationValue"
                    error={errors.durationValue?.message ?? errors.durationUnit?.message}
                  >
                    <div className="flex gap-2">
                      <Input
                        id="durationValue"
                        type="number"
                        min={1}
                        max={3650}
                        error={!!errors.durationValue}
                        {...register('durationValue')}
                      />
                      <Select
                        aria-label="Duration unit"
                        className="w-auto min-w-[130px]"
                        {...register('durationUnit')}
                      >
                        <option value="month">Months</option>
                        <option value="week">Weeks</option>
                        <option value="day">Days</option>
                      </Select>
                    </div>
                  </FormField>

                  <FormField label="Plan Price *" htmlFor="price" error={errors.price?.message}>
                    <div className="relative">
                      <span
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body-md text-on-surface-variant"
                        aria-hidden
                      >
                        {CURRENCY_SYMBOL}
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step={0.01}
                        className="pl-8"
                        error={!!errors.price}
                        {...register('price')}
                      />
                    </div>
                  </FormField>
                </div>

                <FormField label="Description" htmlFor="description" error={errors.description?.message}>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Premium access to all facilities, unlimited group classes, and one personal training session per month."
                    error={!!errors.description}
                    {...register('description')}
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Included Services" icon={ListChecks}>
              <p className="mb-md text-body-md text-on-surface-variant">
                Select the services included with this membership plan.
              </p>
              <Controller
                control={control}
                name="serviceIds"
                render={({ field }) => (
                  <ServicesPicker
                    options={catalog}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    loading={s.services.isLoading}
                    error={s.services.isError}
                  />
                )}
              />
            </FormSection>

            <FormSection
              title="Additional Details"
              icon={Settings2}
              action={
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <ToggleSwitch
                      id="isActive"
                      checked={field.value ?? true}
                      label={field.value ? 'Active' : 'Inactive'}
                      onChange={field.onChange}
                    />
                  )}
                />
              }
            >
              <FormField
                label="Internal Plan Code"
                htmlFor="planCode"
                error={errors.planCode?.message}
              >
                <Input
                  id="planCode"
                  placeholder="Leave blank to generate PLN-0001"
                  error={!!errors.planCode}
                  {...register('planCode')}
                />
              </FormField>
            </FormSection>

            {s.isEdit && (
              <DangerZone
                title="Archive this plan"
                description="It stops appearing in the list and can no longer be sold. Members already on it keep their membership."
                buttonLabel="Archive plan"
                onClick={() => s.setConfirmingArchive(true)}
              />
            )}
          </FormColumn>

          <PlanSummaryPanel
            name={values.name}
            durationValue={Number(values.durationValue) || 0}
            durationUnit={(values.durationUnit ?? 'month') as DurationUnit}
            price={Number(values.price) || 0}
            isActive={values.isActive ?? true}
            services={chosen}
            planCode={s.existing?.planCode ?? null}
          />
        </FormLayout>

        <ConfirmDialog
          open={s.confirmingArchive}
          title="Archive this plan?"
          body="It stops appearing in the list and can no longer be sold. Members already on it keep their membership."
          confirmLabel="Archive plan"
          loading={s.archive.isPending}
          onCancel={() => s.setConfirmingArchive(false)}
          onConfirm={() => s.archive.mutate(s.planId!)}
        />
      </form>
    </FormProvider>
  )
}
