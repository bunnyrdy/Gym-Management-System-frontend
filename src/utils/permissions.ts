import type { Role } from '@/types/auth'

/**
 * Who is allowed to do what, for the purpose of hiding controls.
 *
 * This is a UX layer, not a security boundary. Every rule here is enforced
 * again on the server by an [Authorize] policy, and that is the one that
 * counts — a hidden button is a courtesy, not a lock. The point is that a
 * receptionist should not be shown an Edit control that will answer 403.
 *
 * The role lists mirror AuthPolicies.cs. If they drift, the server wins and the
 * user sees a failed request instead of a missing button, which is the safe
 * direction for them to drift in.
 */

const MANAGERIAL: readonly Role[] = ['owner', 'admin', 'manager']

/** AuthPolicies.MarkAttendanceRoles — managerial plus the front desk. */
const MARK_ATTENDANCE: readonly Role[] = [...MANAGERIAL, 'receptionist']

function has(role: Role | undefined | null, allowed: readonly Role[]): boolean {
  return role ? allowed.includes(role) : false
}

/**
 * Taking the register: writing a mark where there is none. Open to
 * receptionists, because the desk is who sees people arrive.
 */
export function canMarkAttendance(role: Role | undefined | null): boolean {
  return has(role, MARK_ATTENDANCE)
}

/**
 * Changing a record that already exists, or recording one for a past date.
 * Managerial only — rewriting the employment log is a different act from
 * writing it down the first time.
 */
export function canCorrectAttendance(role: Role | undefined | null): boolean {
  return has(role, MANAGERIAL)
}
