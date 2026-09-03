import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { FormField } from '@/components/ui/form-field'
import { Alert } from '@/components/common/alert'
import { AuthHero } from '@/features/auth/components/auth-hero'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useResetPassword } from '@/features/auth/hooks/use-reset-password'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas'
import { ROUTES } from '@/constants/routes'

export default function ResetPasswordPage() {
  const { handleResetPassword, loading, error, hasToken } = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  return (
    <main className="flex min-h-screen w-full">
      <AuthHero />

      <AuthCard
        title="Set a New Password"
        subtitle="Choose a password you haven't used before."
        footer={
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-xs font-mono text-label-md text-primary-container transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to sign in
          </Link>
        }
      >
        {!hasToken ? (
          <Alert>
            This reset link is missing its token.{' '}
            <Link to={ROUTES.FORGOT_PASSWORD} className="underline">
              Request a new one
            </Link>
            .
          </Alert>
        ) : (
          <form
            className="space-y-gutter"
            onSubmit={handleSubmit(handleResetPassword)}
            noValidate
          >
            <FormField
              label="New Password"
              htmlFor="newPassword"
              error={errors.newPassword?.message}
            >
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                error={!!errors.newPassword}
                autoComplete="new-password"
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              label="Confirm Password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                error={!!errors.confirmPassword}
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
            </FormField>

            {error && <Alert>{error}</Alert>}

            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </form>
        )}
      </AuthCard>
    </main>
  )
}
