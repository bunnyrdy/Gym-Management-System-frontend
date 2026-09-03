import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'
import { decodeJwt } from '@/utils/jwt'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  // One-shot flash surfaced on the login page after an interceptor-driven
  // logout so the user isn't dumped there with no explanation. Not persisted.
  sessionExpired: boolean

  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: (reason?: 'expired') => void
  clearSessionExpired: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpired: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          sessionExpired: false,
        }),

      logout: (reason) =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          sessionExpired: reason === 'expired',
        }),

      clearSessionExpired: () => set({ sessionExpired: false }),
    }),
    {
      name: 'steelflex-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

/**
 * Branch id off the access token's `branch_id` claim.
 *
 * Endpoints read tenant + branch from the JWT server-side, so the client
 * rarely needs this — it exists for screens that display which branch the
 * signed-in user is operating on.
 */
export function getBranchId(): number | null {
  const token = useAuthStore.getState().accessToken
  if (!token) return null
  const claim = decodeJwt(token)?.branch_id
  return claim ? Number(claim) : null
}
