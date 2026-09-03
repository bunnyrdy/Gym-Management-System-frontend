/**
 * Every path in the app, in one place.
 *
 * The `/app` prefix arrived with the public website. `/` is now the gym's
 * marketing home — the thing a visitor who types the domain should land on —
 * and everything a signed-in member of staff uses moved one segment down.
 *
 * Keeping the prefix here rather than in the router is what made that a
 * one-file change: screens navigate through ROUTES, so they never spelled a
 * path themselves.
 */
export const ROUTES = {
  // ---------------------------------------------------------------------
  // Public website. No token, no shell chrome, indexed by anyone.
  // ---------------------------------------------------------------------
  HOME: '/',
  SITE_PLANS: '/plans',
  SITE_TRANSFORMATIONS: '/transformations',
  SITE_EVENTS: '/events',
  SITE_CONTACT: '/contact',

  // ---------------------------------------------------------------------
  // Auth. Public, but not part of the marketing site — no site header.
  // ---------------------------------------------------------------------
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // ---------------------------------------------------------------------
  // The admin app.
  // ---------------------------------------------------------------------
  DASHBOARD: '/app/dashboard',

  // `:id` is the details screen and `:id/edit` the form, matching members.
  // A bare `/staff/trainers/4` used to open the form; it now opens the record.
  RECEPTIONISTS: '/app/staff/receptionists',
  RECEPTIONIST_NEW: '/app/staff/receptionists/new',
  receptionistDetails: (id: number | string) => `/app/staff/receptionists/${id}`,
  receptionistEdit: (id: number | string) => `/app/staff/receptionists/${id}/edit`,

  TRAINERS: '/app/staff/trainers',
  TRAINER_NEW: '/app/staff/trainers/new',
  trainerDetails: (id: number | string) => `/app/staff/trainers/${id}`,
  trainerEdit: (id: number | string) => `/app/staff/trainers/${id}/edit`,

  MEMBERS: '/app/members',
  MEMBER_NEW: '/app/members/new',
  // The work queue behind the Pending Payments card, on the dashboard and on
  // the members list alike. A literal segment, so it is declared before
  // `/members/:id` in the router — same reason `/members/new` is.
  MEMBERS_PENDING: '/app/members/pending-payments',
  memberDetails: (id: number | string) => `/app/members/${id}`,
  memberEdit: (id: number | string) => `/app/members/${id}/edit`,
  memberMembership: (id: number | string) => `/app/members/${id}/membership`,
  memberMembershipEdit: (id: number | string, membershipId: number | string) =>
    `/app/members/${id}/membership/${membershipId}`,

  // One roster for every role — the page filters on role rather than there
  // being a trainer screen and a receptionist screen.
  ATTENDANCE: '/app/attendance',
  attendanceDetails: (staffId: number | string) => `/app/attendance/${staffId}`,

  PLANS: '/app/memberships/plans',
  PLAN_NEW: '/app/memberships/plans/new',
  planEdit: (id: number | string) => `/app/memberships/plans/${id}`,

  // The website CMS. One screen group, five kinds of content.
  WEBSITE: '/app/website',
  WEBSITE_MEDIA: '/app/website/media',
  WEBSITE_OFFERS: '/app/website/offers',
  WEBSITE_TRANSFORMATIONS: '/app/website/transformations',
  WEBSITE_EVENTS: '/app/website/events',

  // Operational settings. One tab today (Messaging); the screen is built so
  // Payments or Retention can join it without moving the route.
  SETTINGS: '/app/settings',
} as const
