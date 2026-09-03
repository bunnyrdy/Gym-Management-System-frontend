import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import type { AuthResponse, LoginRequest } from '@/types/auth'

const AUTH_BASE = '/auth'

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>(`${AUTH_BASE}/login`, data),

  // The API revokes the presented refresh token; the access token is stateless.
  logout: () =>
    api.post(`${AUTH_BASE}/logout`, {
      refreshToken: useAuthStore.getState().refreshToken,
    }),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>(`${AUTH_BASE}/refresh`, { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>(`${AUTH_BASE}/forgot-password`, { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>(`${AUTH_BASE}/reset-password`, {
      token,
      newPassword,
    }),
}
