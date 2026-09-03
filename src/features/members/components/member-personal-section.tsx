import { Controller, useFormContext } from 'react-hook-form'
import { HeartPulse, User } from 'lucide-react'
import { FormSection } from '@/components/ui/form-section'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PhotoPicker } from '@/components/ui/photo-picker'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { DigitInput } from '@/components/ui/digit-input'
import { GENDER_LABELS } from '@/features/members/types/member'
import type { MemberFormValues } from '@/features/members/schemas/member.schemas'

/**
 * Personal Info, matching `member designs/code 3.html`: the square photo well
 * on the left, the field grid on the right, and Emergency Contact in its own
 * tinted panel underneath.
 *
 * Only what the design asks for is collected. Data minimisation is not a
 * post-hoc audit — it is deciding not to add the field.
 */
export function MemberPersonalSection({
  currentPhotoUrl,
  onPhotoChange,
}: {
  currentPhotoUrl: string | null
  onPhotoChange: (file: File | null, removed: boolean) => void
}) {
  const { control, register, watch, formState: { errors } } = useFormContext<MemberFormValues>()

  return (
    <FormSection
      title="Personal Info"
      icon={User}
      action={
        /* An inactive member keeps their record, their membership and their
           history — they simply stop receiving anything the gym sends. Same
           control the staff forms use, on the same `status` field. */
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
      <div className="mb-lg flex flex-col gap-lg lg:flex-row">
        <div className="lg:w-1/3">
          <PhotoPicker
            name={watch('fullName') || ''}
            currentUrl={currentPhotoUrl}
            onChange={onPhotoChange}
            shape="square"
          />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-md md:grid-cols-2">
          <FormField label="Full Name *" htmlFor="fullName" error={errors.fullName?.message}>
            <Input
              id="fullName"
              placeholder="e.g. John Doe"
              error={!!errors.fullName}
              {...register('fullName')}
            />
          </FormField>

          <FormField label="Phone Number *" htmlFor="phone" error={errors.phone?.message}>
            <DigitInput
              id="phone"
              placeholder="9876543210"
              error={!!errors.phone}
              {...register('phone')}
            />
          </FormField>

          <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              error={!!errors.email}
              {...register('email')}
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
            <Select id="gender" error={!!errors.gender} {...register('gender')}>
              <option value="">Select Gender</option>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
            <Input
              id="dateOfBirth"
              type="date"
              error={!!errors.dateOfBirth}
              {...register('dateOfBirth')}
            />
          </FormField>

          <FormField label="Address" htmlFor="address" error={errors.address?.message}>
            <Textarea id="address" rows={2} error={!!errors.address} {...register('address')} />
          </FormField>
        </div>
      </div>

      <div className="rounded-md border border-surface-container-high bg-surface-container-low p-md">
        <h3 className="mb-md flex items-center gap-xs font-mono text-label-md font-bold text-on-surface">
          <HeartPulse className="h-4 w-4 text-primary-container" aria-hidden />
          Emergency Contact
        </h3>

        <div className="grid grid-cols-1 gap-md md:grid-cols-2">
          <FormField
            label="Contact Name"
            htmlFor="emergencyContactName"
            error={errors.emergencyContactName?.message}
          >
            <Input
              id="emergencyContactName"
              placeholder="Name"
              className="bg-surface-container-lowest"
              {...register('emergencyContactName')}
            />
          </FormField>

          <FormField
            label="Contact Phone"
            htmlFor="emergencyContactPhone"
            error={errors.emergencyContactPhone?.message}
          >
            <DigitInput
              id="emergencyContactPhone"
              placeholder="9876543210"
              className="bg-surface-container-lowest"
              error={!!errors.emergencyContactPhone}
              {...register('emergencyContactPhone')}
            />
          </FormField>
        </div>
      </div>

      {/* DPDP consent. Its own row rather than a line in Emergency Contact,
          because it is the one control on this form that records a permission
          rather than a fact — and because a consent nobody noticed giving is
          not a consent. It covers offers only: renewal reminders are service
          messages about the membership itself and are sent regardless, which
          is also why a reminder must never carry an offer in it. */}
      <div className="mt-lg border-t border-outline-variant pt-md">
        <Controller
          control={control}
          name="marketingOptIn"
          render={({ field }) => (
            <ToggleSwitch
              id="marketingOptIn"
              checked={field.value ?? false}
              onChange={field.onChange}
              label="Send offers and promotions"
            />
          )}
        />
        <p className="mt-1 text-label-md text-on-surface-variant">
          Off by default. Renewal reminders are sent either way — they are about the
          membership, not marketing.
        </p>
      </div>
    </FormSection>
  )
}
