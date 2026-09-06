import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Spinner } from '@/components/ui/spinner'
import { ProtectedRoute } from '@/app/router/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { SiteShell } from '@/components/layout/site-shell'

// Public marketing site. `/` belongs to the gym's visitors; the admin app moved
// under `/app` when this landed — see the note at the top of constants/routes.ts.
const SiteHomePage = lazy(() => import('@/features/site/pages/public/home'))
const SitePlansPage = lazy(() => import('@/features/site/pages/public/plans'))
const SiteTransformationsPage = lazy(() => import('@/features/site/pages/public/transformations'))
const SiteEventsPage = lazy(() => import('@/features/site/pages/public/events'))
const SiteContactPage = lazy(() => import('@/features/site/pages/public/contact'))

const LoginPage = lazy(() => import('@/features/auth/pages/login'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/forgot-password'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/reset-password'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/dashboard'))
const StaffDetailsPage = lazy(() => import('@/features/staff/pages/staff-details'))
const ReceptionistListPage = lazy(() => import('@/features/staff/pages/receptionist-list'))
const ReceptionistFormPage = lazy(() => import('@/features/staff/pages/receptionist-form'))
const TrainerListPage = lazy(() => import('@/features/staff/pages/trainer-list'))
const TrainerFormPage = lazy(() => import('@/features/staff/pages/trainer-form'))
const MemberListPage = lazy(() => import('@/features/members/pages/member-list'))
const PaymentsPage = lazy(() => import('@/features/payments/pages/payments'))
const MemberFormPage = lazy(() => import('@/features/members/pages/member-form'))
const MemberDetailsPage = lazy(() => import('@/features/members/pages/member-details'))
const MembershipFormPage = lazy(() => import('@/features/members/pages/membership-form'))
const AttendanceListPage = lazy(() => import('@/features/attendance/pages/attendance-list'))
const AttendanceDetailsPage = lazy(() => import('@/features/attendance/pages/attendance-details'))
const PlanListPage = lazy(() => import('@/features/membership-plans/pages/plan-list'))
const PlanFormPage = lazy(() => import('@/features/membership-plans/pages/plan-form'))
const WebsiteSettingsPage = lazy(() => import('@/features/site/pages/admin/website-settings'))
const WebsiteMediaPage = lazy(() => import('@/features/site/pages/admin/website-media'))
const WebsiteOffersPage = lazy(() => import('@/features/site/pages/admin/website-offers'))
const WebsiteTransformationsPage = lazy(
  () => import('@/features/site/pages/admin/website-transformations'),
)
const WebsiteEventsPage = lazy(() => import('@/features/site/pages/admin/website-events'))
const MessagingSettingsPage = lazy(() => import('@/features/settings/pages/messaging-settings'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size="lg" className="text-primary-container" />
    </div>
  )
}

function page(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  // The public website. A pathless layout route, so SiteShell wraps every
  // marketing page without owning a URL segment of its own.
  {
    element: <SiteShell />,
    children: [
      { path: ROUTES.HOME, element: page(<SiteHomePage />) },
      { path: ROUTES.SITE_PLANS, element: page(<SitePlansPage />) },
      { path: ROUTES.SITE_TRANSFORMATIONS, element: page(<SiteTransformationsPage />) },
      { path: ROUTES.SITE_EVENTS, element: page(<SiteEventsPage />) },
      { path: ROUTES.SITE_CONTACT, element: page(<SiteContactPage />) },
    ],
  },

  // Auth. Public, but outside SiteShell — these screens are full-bleed and
  // carry no marketing header.
  { path: ROUTES.LOGIN, element: page(<LoginPage />) },
  { path: ROUTES.FORGOT_PASSWORD, element: page(<ForgotPasswordPage />) },
  { path: ROUTES.RESET_PASSWORD, element: page(<ResetPasswordPage />) },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: ROUTES.DASHBOARD, element: page(<DashboardPage />) },
          { path: ROUTES.RECEPTIONISTS, element: page(<ReceptionistListPage />) },
          { path: ROUTES.RECEPTIONIST_NEW, element: page(<ReceptionistFormPage />) },
          // '/new' is declared above so it is not swallowed by ':id'.
          { path: '/app/staff/receptionists/:id', element: page(<StaffDetailsPage role="receptionists" />) },
          { path: '/app/staff/receptionists/:id/edit', element: page(<ReceptionistFormPage />) },
          { path: ROUTES.TRAINERS, element: page(<TrainerListPage />) },
          { path: ROUTES.TRAINER_NEW, element: page(<TrainerFormPage />) },
          { path: '/app/staff/trainers/:id', element: page(<StaffDetailsPage role="trainers" />) },
          { path: '/app/staff/trainers/:id/edit', element: page(<TrainerFormPage />) },
          { path: ROUTES.PAYMENTS, element: page(<PaymentsPage />) },

          { path: ROUTES.MEMBERS, element: page(<MemberListPage />) },
          { path: ROUTES.MEMBER_NEW, element: page(<MemberFormPage />) },
          // Literal segments before `/members/:id`, or the router reads
          // "pending-payments" as a member id.
          // The work queue is a tab of the payments page now. Redirecting
          // rather than keeping a second copy: both were the same
          // `?paymentStatus=owing` query, and two screens reading it is how
          // they come to disagree. The dashboard and members-list cards link
          // through ROUTES.MEMBERS_PENDING and needed no change.
          {
            path: ROUTES.MEMBERS_PENDING,
            element: <Navigate to={`${ROUTES.PAYMENTS}?tab=pending`} replace />,
          },
          // Order matters: '/members/new' is declared above so it is not
          // swallowed by ':id'.
          { path: '/app/members/:id', element: page(<MemberDetailsPage />) },
          { path: '/app/members/:id/edit', element: page(<MemberFormPage />) },
          { path: '/app/members/:id/membership', element: page(<MembershipFormPage />) },
          // Same screen, edit mode: with a membership id it rewrites the
          // agreement in force instead of selling a new one.
          { path: '/app/members/:id/membership/:membershipId', element: page(<MembershipFormPage />) },
          { path: ROUTES.ATTENDANCE, element: page(<AttendanceListPage />) },
          // One roster for every role; ':staffId' opens that person's history.
          { path: '/app/attendance/:staffId', element: page(<AttendanceDetailsPage />) },
          { path: ROUTES.PLANS, element: page(<PlanListPage />) },
          { path: ROUTES.PLAN_NEW, element: page(<PlanFormPage />) },
          { path: '/app/memberships/plans/:id', element: page(<PlanFormPage />) },
          // The website CMS.
          { path: ROUTES.WEBSITE, element: page(<WebsiteSettingsPage />) },
          { path: ROUTES.WEBSITE_MEDIA, element: page(<WebsiteMediaPage />) },
          { path: ROUTES.WEBSITE_OFFERS, element: page(<WebsiteOffersPage />) },
          { path: ROUTES.WEBSITE_TRANSFORMATIONS, element: page(<WebsiteTransformationsPage />) },
          { path: ROUTES.WEBSITE_EVENTS, element: page(<WebsiteEventsPage />) },
          // Owner/admin only, enforced by the ManageSettings policy on the API.
          { path: ROUTES.SETTINGS, element: page(<MessagingSettingsPage />) },
        ],
      },
    ],
  },

  // Unknown path. It used to redirect to the login form, which was right when
  // the app was the whole product; now a mistyped marketing URL belongs back on
  // the marketing home, not at a sign-in screen the visitor has no account for.
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
