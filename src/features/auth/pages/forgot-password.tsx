import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Alert } from '@/components/common/alert'
import { AuthHero } from '@/features/auth/components/auth-hero'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas'
import { ROUTES } from '@/constants/routes'

export default function ForgotPasswordPage() {
  const { handleForgotPassword, loading, sent, error } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  return (
    <main className="flex min-h-screen w-full">
      <AuthHero />

      <AuthCard
        title="Forgot Password"
        subtitle="Enter your email and we'll send you a link to reset it."
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
        {sent ? (
          <Alert variant="info">
            If that email has an account, a reset link is on its way. The link
            expires in one hour.
          </Alert>
        ) : (
          <form
            className="space-y-gutter"
            onSubmit={handleSubmit(handleForgotPassword)}
            noValidate
          >
            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="admin@steelflex.com"
                error={!!errors.email}
                autoComplete="email"
                {...register('email')}
              />
            </FormField>

            {error && <Alert>{error}</Alert>}

            <Button type="submit" loading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </AuthCard>
    </main>
  )
}
