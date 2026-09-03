/**
 * Mirrors GymApis.Dtos.DashboardResponse.
 *
 * The two money fields are optional because the server omits them for anyone
 * outside AuthPolicies.ViewRevenueRoles. That is the whole client-side rule:
 * render the cards that arrived. Re-deriving "may this role see revenue?" here
 * would be a second copy of an authorization decision, and the copy is the one
 * that goes stale.
 */
export interface DashboardKpis {
  activeMembers: number
  newMembersThisMonth: number
  expiringSoon: number
  expired: number
  pendingPayments: number
  pendingPaymentsValue: number | null
  monthlyRevenue: number | null
}

/** The donut. The three slices sum to `total`, so the ring closes. */
export interface MembershipMix {
  active: number
  expiringSoon: number
  expired: number
  total: number
}

export interface ExpiringMembershipItem {
  memberId: number
  fullName: string
  photoUrl: string | null
  planName: string | null
  endDate: string | null
  /** Negative for a membership that has already lapsed. */
  daysRemaining: number | null
  membershipState: string
}

export interface StaffNotMarkedItem {
  staffId: number
  fullName: string
  role: string
  photoUrl: string | null
}

export interface DashboardAttendance {
  totalStaff: number
  present: number
  absent: number
  notMarked: number
  notMarkedStaff: StaffNotMarkedItem[]
}

export interface ActivityItem {
  id: number
  action: string
  entityType: string
  entityId: number | null
  description: string
  createdAt: string
  actorEmail: string | null
}

export interface DashboardSummary {
  kpis: DashboardKpis
  mix: MembershipMix
  expiring: ExpiringMembershipItem[]
  attendance: DashboardAttendance
  activity: ActivityItem[]
}
