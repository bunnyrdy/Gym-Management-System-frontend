import { Controller, FormProvider } from 'react-hook-form'
import { BadgeCheck, ListChecks } from 'lucide-react'
import { useStaffForm } from '@/features/staff/hooks/use-staff-form'
import { PersonalInfoSection } from '@/features/staff/components/personal-info-section'
import { ShiftSection } from '@/features/staff/components/shift-section'
import { FormSection } from '@/components/ui/form-section'
import { TagPicker } from '@/features/staff/components/tag-picker'
import { DangerZone } from '@/components/ui/danger-zone'
import { ErasePanel } from '@/components/ui/erase-panel'
import {
  FormHeader,
  FormLayout,
  FormColumn,
} from '@/components/ui/form-shell'
import {
  StaffSummaryPanel,
  SummaryRow,
} from '@/features/staff/components/staff-summary-panel'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ROUTES } from '@/constants/routes'
import { hhmm, type StaffStatus } from '@/features/staff/types/staff'

export default function ReceptionistFormPage() {
  const s = useStaffForm('receptionists', ROUTES.RECEPTIONISTS)
  const { register, control, watch, formState: { errors } } = s.form
  const values = watch()
  const shift = s.lookups.shifts.data?.find((x) => x.id === Number(values.shiftId))

  if (s.isLoading)
    return <div className="grid min-h-[50vh] place-items-center"><Spinner size="lg" className="text-primary-container" /></div>

  return (
    <FormProvider {...s.form}>
      <form onSubmit={s.submit} noValidate>
        <FormHeader
          listLabel="Receptionists"
          listRoute={ROUTES.RECEPTIONISTS}
          title={s.isEdit ? 'Edit Receptionist Profile' : 'Add Receptionist'}
          isEdit={s.isEdit}
          saving={s.saving}
          saveDisabled={s.saveDisabled}
          onCancel={s.cancel}
          saveLabel={s.isEdit ? 'Save Changes' : 'Create Receptionist'}
        />

        <FormLayout>
          <FormColumn>
            <PersonalInfoSection
              currentPhotoUrl={s.existing?.photoUrl ?? null}
              onPhotoChange={s.onPhotoChange}
              showEmergencyContact
            />

            <FormSection
              title="Professional Information"
              icon={BadgeCheck}
              action={
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <ToggleSwitch
                      id="status"
                      checked={field.value === 'active'}
                      label={field.value === 'active' ? 'Active' : 'Inactive'}
                      onChange={(next) => field.onChange(next ? 'active' : 'inactive')}
                    />
                  )}
                />
              }
            >
              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <FormField label="Employee ID" htmlFor="staffCode">
                  {/* Server-assigned. Read-only here and ignored if posted. */}
                  <Input
                    id="staffCode"
                    readOnly
                    value={s.existing?.staffCode ?? 'Generated on save'}
                    className="bg-surface-container-low text-on-surface-variant"
                  />
                </FormField>

                <FormField label="Joining Date" htmlFor="joiningDate" error={errors.joiningDate?.message}>
                  <Input id="joiningDate" type="date" error={!!errors.joiningDate} {...register('joiningDate')} />
                </FormField>

                <FormField label="Job Title" htmlFor="jobTitle" error={errors.jobTitle?.message}>
                  <Select id="jobTitle" {...register('jobTitle')}>
                    <option value="">Not specified</option>
                    <option value="Head Receptionist">Head Receptionist</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Front Desk Associate">Front Desk Associate</option>
                  </Select>
                </FormField>

                <FormField label="Years of Experience" htmlFor="experienceYears" error={errors.experienceYears?.message}>
                  <Input id="experienceYears" type="number" min={0} max={60} step={0.5} error={!!errors.experienceYears} {...register('experienceYears')} />
                </FormField>
              </div>
            </FormSection>

            <ShiftSection shifts={s.lookups.shifts.data ?? []} />

            <FormSection title="Responsibilities" icon={ListChecks}>
              <Controller
                control={control}
                name="responsibilityTagIds"
                render={({ field }) => (
                  <TagPicker
                    options={s.lookups.responsibilities.data ?? []}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />

              <div className="mt-md">
                <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
                  <Textarea id="notes" rows={3} placeholder="Anything the team should know" error={!!errors.notes} {...register('notes')} />
                </FormField>
              </div>
            </FormSection>

            {s.isEdit && (
              <>
                <DangerZone
                  title="Danger Zone"
                  description="Removes this receptionist from active lists. Attendance and payroll history is kept."
                  buttonLabel="Delete Receptionist"
                  onClick={() => s.setConfirmingDelete(true)}
                />

                <ErasePanel
                  subject="receptionist"
                  kept="The employment record — attendance and assignments still reference it"
                  loading={s.erase.isPending}
                  onErase={() => s.erase.mutate(s.staffId!)}
                />
              </>
            )}
          </FormColumn>

          <StaffSummaryPanel
            name={values.fullName || ''}
            photoUrl={s.photoUrl}
            status={(values.status ?? 'active') as StaffStatus}
            badge="Receptionist"
          >
            <SummaryRow label="ID" value={s.existing?.staffCode ?? '—'} />
            <SummaryRow label="Experience" value={values.experienceYears ? `${values.experienceYears} years` : '—'} />
            <SummaryRow
              label="Shift"
              value={shift ? `${shift.name}${values.customStartTime ? ` (${values.customStartTime}–${values.customEndTime})` : shift.startTime ? ` (${hhmm(shift.startTime)}–${hhmm(shift.endTime)})` : ''}` : '—'}
            />
            <SummaryRow label="Days" value={values.workingDays?.length ? `${values.workingDays.length}/week` : '—'} />
          </StaffSummaryPanel>
        </FormLayout>

        <ConfirmDialog
          open={s.confirmingDelete}
          title="Delete this receptionist?"
          body="They will be removed from active lists. Attendance and payroll history is preserved, and this can be reversed by an administrator."
          confirmLabel="Delete"
          loading={s.remove.isPending}
          onCancel={() => s.setConfirmingDelete(false)}
          onConfirm={() => s.remove.mutate(s.staffId!)}
        />
      </form>
    </FormProvider>
  )
}
