import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/features/auth/services/auth.service'
import { ROUTES } from '@/constants/routes'
import type { ResetPasswordFormValues } from '@/features/auth/schemas/auth.schemas'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'

export function useResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError('This reset link is missing its token. Request a new one.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authService.resetPassword(token, values.newPassword)
      // The API revoked every refresh token for this user, so a fresh sign-in
      // is the only way forward.
      navigate(`${ROUTES.LOGIN}?reset=1`, { replace: true })
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      setError(
        axiosError.response?.data?.message ??
          'This reset link is invalid or has expired.',
      )
    } finally {
      setLoading(false)
    }
  }

  return { handleResetPassword, loading, error, hasToken: Boolean(token) }
}
