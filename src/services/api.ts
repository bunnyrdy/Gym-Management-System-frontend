import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import { ROUTES } from '@/constants/routes'

// Dynamic import breaks the api ↔ router ↔ guards ↔ services eval cycle.
// Called only from the 401 handler, so the top-level import graph stays clean.
async function redirectToLogin() {
  const { router } = await import('@/app/router')
  await router.navigate(ROUTES.LOGIN, { replace: true })
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5023/api'

/**
 * Absolute URL for a stored upload path.
 *
 * `photoUrl` comes back root-relative ("/uploads/members/ab12.jpg") because the
 * API has no idea what origin is serving the SPA. Left alone, the browser
 * resolves it against the SPA's own origin — and in dev that is Vite, which
 * answers every unknown path with index.html rather than a 404. The <img> then
 * decodes HTML, fails, and silently falls back to initials, which looks exactly
 * like "the upload did not work".
 *
 * Absolute, blob: and data: URLs pass through untouched, so a local preview of
 * a file that has not been uploaded yet still works.
 */
const ASSET_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^(https?:|blob:|data:)/.test(path)) return path
  return `${ASSET_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // File uploads post FormData. The instance-wide JSON content type would
  // overwrite the multipart header — and with it the boundary the server needs
  // to split the parts — so drop it and let the browser set both.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// The backend reports failures as { errors: [...] } or, for model validation,
// { errors: { field: [...] }, title }. The UI reads `data.message`, so fold the
// backend shape down into a single message string the hooks can display.
function normalizeError(error: any) {
  const data = error.response?.data
  if (!data || typeof data.message === 'string') return
  const { errors, title } = data
  let message: string | undefined
  if (Array.isArray(errors)) {
    message = errors.join(' ')
  } else if (errors && typeof errors === 'object') {
    message = Object.values(errors).flat().join(' ')
  }
  data.message = message ?? title ?? undefined
}

// Paths where a 401 must NOT trigger refresh-and-retry, for two different
// reasons:
//
//   * /auth/* — a 401 is the expected business outcome (bad credentials, dead
//     refresh token). Retrying it would loop.
//   * /public/* — the marketing site is read by visitors with no session at
//     all. Without this, one 401 from a public endpoint logs the visitor out
//     of nothing and redirects them from the gym's homepage to a login form.
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/public',
]
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const skipsRefresh = NO_REFRESH_PATHS.some((path) =>
      (originalRequest?.url ?? '').includes(path),
    )

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipsRefresh
    ) {
      originalRequest._retry = true
      const refreshToken = useAuthStore.getState().refreshToken

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        } catch {
          useAuthStore.getState().logout('expired')
          await redirectToLogin()
        }
      } else {
        useAuthStore.getState().logout('expired')
        await redirectToLogin()
      }
    }

    normalizeError(error)
    return Promise.reject(error)
  },
)
