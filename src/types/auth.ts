export type Role =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'trainer'
  | 'receptionist'
  | 'member'

export interface User {
  id: number
  email: string
  role: Role
  tenantId: number
  branchId: number
}

/** Mirrors GymApis.Dtos.AuthResponse. */
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  userId: number
  email: string
  role: Role
}

export interface LoginRequest {
  email: string
  password: string
}

/** The API reports failures as { errors: [...] }; api.ts folds that into `message`. */
export interface ApiError {
  message?: string
  errors?: string[] | Record<string, string[]>
}
