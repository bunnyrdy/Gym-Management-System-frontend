import { FormProvider } from 'react-hook-form'
import { useMemberForm } from '@/features/members/hooks/use-member-form'
import { MemberPersonalSection } from '@/features/members/components/member-personal-section'
import { MembershipInfoSection } from '@/features/members/components/membership-info-section'
import { PaymentInfoSection } from '@/features/members/components/payment-info-section'
import { MemberSummaryPanel } from '@/features/members/components/member-summary-panel'
import { FormColumn, FormHeader, FormLayout } from '@/components/ui/form-shell'
import { ErasePanel } from '@/components/ui/erase-panel'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/constants/routes'
import type { MemberStatus } from '@/features/members/types/member'

export default function MemberFormPage() {
  const s = useMemberForm()
  const { watch } = s.form
  const values = watch()

  if (s.isLoading) {
    return (
      <div className="flex justify-center py-xl">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  return (
    <FormProvider {...s.form}>
      <form onSubmit={s.submit} noValidate>
        <FormHeader
          listLabel="Members"
          listRoute={ROUTES.MEMBERS}
          title={s.isEdit ? 'Edit Member' : 'Add Member'}
          isEdit={s.isEdit}
          saving={s.saving}
          saveDisabled={s.saveDisabled}
          onCancel={s.cancel}
          saveLabel={s.isEdit ? 'Save Changes' : 'Save Member'}
        />

        <FormLayout>
          <FormColumn>
            <MemberPersonalSection
              currentPhotoUrl={s.photoUrl}
              onPhotoChange={s.onPhotoChange}
            />

            {/* Create only. Add Member sells the first membership; every later
                change — a partial payment, a renewal, an extension, a plan or
                expiry change — belongs to Manage Membership, which writes dated
                rows instead of rewriting this one. Rendering these read-only
                here only invited the question of why they cannot be typed in. */}
            {!s.isEdit && (
              <>
                <MembershipInfoSection
                  plans={s.plans.data ?? []}
                  selectedPlan={s.selectedPlan}
                  onExpiryOverride={s.markExpiryOverridden}
                />

                <PaymentInfoSection money={s.money} />
              </>
            )}

            {/* No delete. A member is deactivated with the switch above, which
                is reversible; erasure is the only thing that removes them, and
                it is the irreversible DPDP action, not a tidy-up. */}
            {s.isEdit && (
              <ErasePanel
                subject="member"
                kept="The payment record"
                loading={s.erase.isPending}
                onErase={() => s.erase.mutate(s.memberId!)}
              />
            )}
          </FormColumn>

          <MemberSummaryPanel
            name={values.fullName || ''}
            photoUrl={s.photoUrl}
            status={(values.status ?? 'active') as MemberStatus}
            memberCode={s.existing?.memberCode ?? null}
            plan={s.selectedPlan}
            joiningDate={values.joiningDate ?? ''}
            expiryDate={values.expiryDate ?? ''}
            total={s.money.total}
            remaining={s.money.remaining}
          />
        </FormLayout>
      </form>
    </FormProvider>
  )
}
