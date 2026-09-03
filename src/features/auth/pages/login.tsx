import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form-field'
import { Alert } from '@/components/common/alert'
import { AuthHero } from '@/features/auth/components/auth-hero'
import { AuthCard } from '@/features/auth/components/auth-card'
import { useLogin } from '@/features/auth/hooks/use-login'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/auth.schemas'
import { ROUTES } from '@/constants/routes'

export default function LoginPage() {
  const { handleLogin, loading, error } = useLogin()
  const [params] = useSearchParams()
  const justReset = params.get('reset') === '1'

  // Snapshot the flag on first mount and clear it immediately. Local state (not
  // a store subscription) keeps the banner up after the clear and survives
  // StrictMode's simulated remount.
  const [showExpired] = useState(() => useAuthStore.getState().sessionExpired)
  useEffect(() => {
    useAuthStore.getState().clearSessionExpired()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  return (
    <main className="flex min-h-screen w-full">
      <AuthHero />

      <AuthCard
        title="Welcome Back"
        subtitle="Please enter your details to sign in."
        footer={
          <p className="text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <a
              href="mailto:support@steelflex.com"
              className="font-mono text-label-md text-primary-container transition-colors hover:text-primary"
            >
              Contact Support
            </a>
          </p>
        }
      >
        <form
          className="space-y-gutter"
          onSubmit={handleSubmit(handleLogin)}
          noValidate
        >
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="admin@steelflex.com"
              error={!!errors.email}
              autoComplete="email"
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              placeholder="••••••••"
              error={!!errors.password}
              autoComplete="current-password"
              {...register('password')}
            />
          </FormField>

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember"
              label="Remember Me"
              {...register('rememberMe')}
            />
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="font-mono text-label-md text-primary-container transition-colors hover:text-primary"
            >
              Forgot Password?
            </Link>
          </div>

          {justReset && !error && (
            <Alert variant="info">
              Password updated. Sign in with your new password.
            </Alert>
          )}

          {showExpired && !error && !justReset && (
            <Alert variant="info">
              Your session expired. Please sign in again.
            </Alert>
          )}

          {error && <Alert>{error}</Alert>}

          <Button type="submit" loading={loading}>
            Sign In
          </Button>
        </form>
      </AuthCard>
    </main>
  )
}
