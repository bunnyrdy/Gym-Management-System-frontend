import { Controller, FormProvider } from 'react-hook-form'
import { Briefcase, Users } from 'lucide-react'
import { useStaffForm } from '@/features/staff/hooks/use-staff-form'
import { PersonalInfoSection } from '@/features/staff/components/personal-info-section'
import { ShiftSection } from '@/features/staff/components/shift-section'
import { FormSection } from '@/components/ui/form-section'
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

export default function TrainerFormPage() {
  const s = useStaffForm('trainers', ROUTES.TRAINERS)
  const { register, control, watch, formState: { errors } } = s.form
  const values = watch()
  const shift = s.lookups.shifts.data?.find((x) => x.id === Number(values.shiftId))

  if (s.isLoading)
    return <div className="grid min-h-[50vh] place-items-center"><Spinner size="lg" className="text-primary-container" /></div>

  return (
    <FormProvider {...s.form}>
      <form onSubmit={s.submit} noValidate>
        <FormHeader
          listLabel="Trainers"
          listRoute={ROUTES.TRAINERS}
          title={s.isEdit ? 'Edit Trainer' : 'Add Trainer'}
          isEdit={s.isEdit}
          saving={s.saving}
          saveDisabled={s.saveDisabled}
          onCancel={s.cancel}
          saveLabel={s.isEdit ? 'Save Trainer' : 'Create Trainer'}
        />

        <FormLayout>
          <FormColumn>
            <PersonalInfoSection
              currentPhotoUrl={s.existing?.photoUrl ?? null}
              onPhotoChange={s.onPhotoChange}
            />

            <FormSection
              title="Professional Information"
              icon={Briefcase}
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

                <FormField label="Specialization" htmlFor="specialization" error={errors.specialization?.message}>
                  <Select id="specialization" error={!!errors.specialization} {...register('specialization')}>
                    <option value="">Not specified</option>
                    {(s.lookups.specializations.data ?? []).map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Years of Experience" htmlFor="experienceYears" error={errors.experienceYears?.message}>
                  <Input id="experienceYears" type="number" min={0} max={60} step={0.5} error={!!errors.experienceYears} {...register('experienceYears')} />
                </FormField>

                <div className="md:col-span-2">
                  <FormField
                    label="Primary Qualifications"
                    htmlFor="qualifications"
                    error={errors.qualifications?.message}
                  >
                    <Input
                      id="qualifications"
                      placeholder="NSCA-CSCS, Precision Nutrition L1, CPR/AED"
                      error={!!errors.qualifications}
                      {...register('qualifications')}
                    />
                  </FormField>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    Separate each certification with a comma.
                  </p>
                </div>
              </div>
            </FormSection>

            <ShiftSection shifts={s.lookups.shifts.data ?? []} />

            <FormSection title="Personal Training" icon={Users}>
              <div className="flex flex-wrap items-center justify-between gap-md">
                <div>
                  <div className="text-display-lg text-primary-container">{s.existing?.ptClientCount ?? 0}</div>
                  <div className="font-mono text-label-md text-on-surface-variant">Active PT clients</div>
                </div>
                {/* The roster and session ledger are the PT module; this count
                    reads pt_assignments directly and stays 0 until that ships. */}
                <p className="max-w-[280px] text-body-md text-on-surface-variant">
                  Client assignments are managed from the Personal Training module.
                </p>
              </div>

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
                  description="Removes this trainer from active lists and future rosters. Attendance history and past PT records are kept."
                  buttonLabel="Delete Trainer"
                  onClick={() => s.setConfirmingDelete(true)}
                />

                <ErasePanel
                  subject="trainer"
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
            badge={values.specialization || 'Trainer'}
          >
            <SummaryRow label="ID" value={s.existing?.staffCode ?? '—'} />
            <SummaryRow label="Experience" value={values.experienceYears ? `${values.experienceYears} years` : '—'} />
            <SummaryRow label="PT Clients" value={String(s.existing?.ptClientCount ?? 0)} />
            <SummaryRow
              label="Shift"
              value={shift ? `${shift.name}${values.customStartTime ? ` (${values.customStartTime}–${values.customEndTime})` : shift.startTime ? ` (${hhmm(shift.startTime)}–${hhmm(shift.endTime)})` : ''}` : '—'}
            />
            <SummaryRow label="Contact" value={values.email || values.phone || '—'} />
          </StaffSummaryPanel>
        </FormLayout>

        <ConfirmDialog
          open={s.confirmingDelete}
          title="Delete this trainer?"
          body="They will be removed from active lists and future rosters. Attendance history and past PT records are preserved, and this can be reversed by an administrator."
          confirmLabel="Delete"
          loading={s.remove.isPending}
          onCancel={() => s.setConfirmingDelete(false)}
          onConfirm={() => s.remove.mutate(s.staffId!)}
        />
      </form>
    </FormProvider>
  )
}
