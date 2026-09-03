import { useFormContext } from 'react-hook-form'
import { User } from 'lucide-react'
import { FormSection } from '@/components/ui/form-section'
import { PhotoPicker } from '@/components/ui/photo-picker'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DigitInput } from '@/components/ui/digit-input'
import { GENDER_LABELS } from '@/features/staff/types/staff'
import type { StaffFormValues } from '@/features/staff/schemas/staff.schemas'

/**
 * Personal Information — identical across every staff role, so it lives once
 * here. `showEmergencyContact` is the only variation: the receptionist design
 * has the pair, the trainer design does not.
 */
export function PersonalInfoSection({
  currentPhotoUrl,
  onPhotoChange,
  showEmergencyContact = false,
}: {
  currentPhotoUrl: string | null
  onPhotoChange: (file: File | null, removed: boolean) => void
  showEmergencyContact?: boolean
}) {
  const { register, watch, formState: { errors } } = useFormContext<StaffFormValues>()

  return (
    <FormSection title="Personal Information" icon={User}>
      <div className="mb-lg flex flex-col gap-lg sm:flex-row">
        <PhotoPicker
          name={watch('fullName') || ''}
          currentUrl={currentPhotoUrl}
          onChange={onPhotoChange}
        />

        <div className="grid flex-1 grid-cols-1 gap-md md:grid-cols-2">
          <FormField label="Full Name" htmlFor="fullName" error={errors.fullName?.message}>
            <Input id="fullName" error={!!errors.fullName} {...register('fullName')} />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
            <Select id="gender" error={!!errors.gender} {...register('gender')}>
              <option value="">Not specified</option>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Date of Birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
            <Input id="dateOfBirth" type="date" error={!!errors.dateOfBirth} {...register('dateOfBirth')} />
          </FormField>

          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            {/* Ten digits, enforced by construction. The schema and the API
                both demand ^\d{10}$, so a field that accepts an eleventh
                character or a pasted "+91 98765 43210" only defers the error. */}
            <DigitInput id="phone" placeholder="9876543210" error={!!errors.phone} {...register('phone')} />
          </FormField>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="name@steelflex.com" error={!!errors.email} {...register('email')} />
        </FormField>

        <FormField label="Address" htmlFor="address" error={errors.address?.message}>
          <Textarea id="address" rows={2} error={!!errors.address} {...register('address')} />
        </FormField>

        {showEmergencyContact && (
          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            <FormField label="Emergency Contact" htmlFor="emergencyContactName" error={errors.emergencyContactName?.message}>
              <Input id="emergencyContactName" placeholder="Name & relation" {...register('emergencyContactName')} />
            </FormField>
            <FormField label="Emergency Phone" htmlFor="emergencyContactPhone" error={errors.emergencyContactPhone?.message}>
              <DigitInput id="emergencyContactPhone" placeholder="9876543210" error={!!errors.emergencyContactPhone} {...register('emergencyContactPhone')} />
            </FormField>
          </div>
        )}
      </div>
    </FormSection>
  )
}
