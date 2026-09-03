import { Controller, useFormContext } from 'react-hook-form'
import { Clock } from 'lucide-react'
import { FormSection } from '@/components/ui/form-section'
import { WeekdayPicker } from './weekday-picker'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { hhmm, type ShiftOption } from '@/features/staff/types/staff'
import type { StaffFormValues } from '@/features/staff/schemas/staff.schemas'

/** Shift Information — the working-day toggles plus shift and optional overrides. */
export function ShiftSection({ shifts }: { shifts: ShiftOption[] }) {
  const { register, control, watch, formState: { errors } } = useFormContext<StaffFormValues>()
  const selected = shifts.find((s) => s.id === Number(watch('shiftId')))

  return (
    <FormSection title="Shift Information" icon={Clock}>
      <div className="mb-md">
        <span className="mb-2 block font-mono text-label-md text-on-surface">Working Days</span>
        <Controller
          control={control}
          name="workingDays"
          render={({ field }) => <WeekdayPicker value={field.value ?? []} onChange={field.onChange} />}
        />
        {errors.workingDays && (
          <p className="mt-1 text-label-sm text-error" role="alert">{errors.workingDays.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-md md:grid-cols-3">
        <FormField label="Shift Type" htmlFor="shiftId" error={errors.shiftId?.message}>
          <Select id="shiftId" error={!!errors.shiftId} {...register('shiftId')}>
            <option value="">No shift assigned</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Start Time" htmlFor="customStartTime" error={errors.customStartTime?.message}>
          <Input id="customStartTime" type="time" error={!!errors.customStartTime} {...register('customStartTime')} />
        </FormField>

        <FormField label="End Time" htmlFor="customEndTime" error={errors.customEndTime?.message}>
          <Input id="customEndTime" type="time" error={!!errors.customEndTime} {...register('customEndTime')} />
        </FormField>
      </div>

      <p className="mt-sm text-label-sm text-on-surface-variant">
        {selected?.startTime
          ? `${selected.name} runs ${hhmm(selected.startTime)}–${hhmm(selected.endTime)}. Set times only to override.`
          : 'Leave times blank to use the shift default.'}
      </p>
    </FormSection>
  )
}
