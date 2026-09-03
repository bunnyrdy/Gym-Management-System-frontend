import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { authService } from '@/features/auth/services/auth.service'
import { ROUTES } from '@/constants/routes'
import { buildUserFromToken } from '@/utils/jwt'
import type { LoginFormValues } from '@/features/auth/schemas/auth.schemas'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authService.login({
        email: values.email,
        password: values.password,
      })
      // The response carries tokens plus id/email/role; the rest of the user
      // (tenant, branch) comes off the JWT claims.
      const user = buildUserFromToken(data.accessToken, {
        id: data.userId,
        email: data.email,
        role: data.role,
      })
      login(user, data.accessToken, data.refreshToken)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      setError(
        axiosError.response?.data?.message ??
          'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return { handleLogin, loading, error }
}
