import type { Role, User } from '@/types/auth'

/**
 * Claims baked into the access token by the backend TokenService.
 * sub = user id; tenant_id/branch_id are pinned to 1 in V1 but are already
 * carried so nothing has to change when multi-branch ships.
 */
interface AccessTokenClaims {
  sub?: string
  email?: string
  tenant_id?: string
  branch_id?: string
  role?: string
  exp?: number
}

/** Decode a JWT payload without verifying the signature (display use only). */
export function decodeJwt(token: string): AccessTokenClaims | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as AccessTokenClaims
  } catch {
    return null
  }
}

/** Build the store's User from the token claims plus whatever the caller knows. */
export function buildUserFromToken(
  accessToken: string,
  overrides: Partial<User> = {},
): User {
  const claims = decodeJwt(accessToken)
  return {
    id: Number(claims?.sub ?? 0),
    email: claims?.email ?? '',
    role: (claims?.role as Role) ?? 'receptionist',
    tenantId: Number(claims?.tenant_id ?? 1),
    branchId: Number(claims?.branch_id ?? 1),
    ...overrides,
  }
}
