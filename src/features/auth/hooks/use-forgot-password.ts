import { useState } from 'react'
import { authService } from '@/features/auth/services/auth.service'
import type { ForgotPasswordFormValues } from '@/features/auth/schemas/auth.schemas'

export function useForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setLoading(true)
    setError(null)
    try {
      await authService.forgotPassword(values.email)
      // The API answers 202 whether or not the address has an account, and we
      // show the same confirmation either way — no account enumeration here.
      setSent(true)
    } catch {
      setError('Could not send the reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return { handleForgotPassword, loading, sent, error }
}
