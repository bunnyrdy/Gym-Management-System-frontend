import { Link } from 'react-router-dom'
import { ListChecks, UserPlus } from 'lucide-react'
import { Alert } from '@/components/common/alert'
import { Spinner } from '@/components/ui/spinner'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth'
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard'
import { KpiGrid } from '@/features/dashboard/components/kpi-grid'
import { MembershipDonut } from '@/features/dashboard/components/membership-donut'
import { ExpiringMembershipsCard } from '@/features/dashboard/components/expiring-memberships-card'
import { AttendanceSnapshotCard } from '@/features/dashboard/components/attendance-snapshot-card'
import { RecentActivityCard } from '@/features/dashboard/components/recent-activity-card'

/** Morning / Afternoon / Evening, from the viewer's own clock. */
function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch, isFetching } = useDashboard()

  return (
    <>
      <header className="mb-lg flex flex-wrap items-end justify-between gap-md">
        <div>
          <h1 className="text-headline-lg-mobile text-on-background md:text-headline-lg">
            {greeting()}, welcome back to Steel Flex
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {user?.email} · <span className="capitalize">{user?.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-sm">
          <Link
            to={ROUTES.MEMBER_NEW}
            className="flex items-center gap-xs rounded-md bg-primary-container px-md py-2 font-mono text-label-md font-bold text-on-primary transition-colors hover:bg-primary"
          >
            <UserPlus className="h-4 w-4" aria-hidden /> Add Member
          </Link>
          <Link
            to={ROUTES.PLANS}
            className="flex items-center gap-xs rounded-md border border-primary-container px-md py-2 font-mono text-label-md font-bold text-primary-container transition-colors hover:bg-primary-container/5"
          >
            <ListChecks className="h-4 w-4" aria-hidden /> Membership Plans
          </Link>
        </div>
      </header>

      {isError && (
        <Alert variant="error" className="mb-lg">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <span>Could not load the dashboard.</span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="font-mono text-label-md font-bold underline disabled:opacity-40"
            >
              {isFetching ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        </Alert>
      )}

      {isLoading && (
        <div className="grid place-items-center py-xl">
          <Spinner size="lg" className="text-primary-container" />
        </div>
      )}

      {data && (
        <div className="flex flex-col gap-xl">
          <KpiGrid kpis={data.kpis} />

          {/* 8/4 split above lg, stacked below — the table is the wide thing on
              the page and the two right-hand cards are its sidebar. */}
          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <ExpiringMembershipsCard rows={data.expiring} />
            </div>

            <div className="flex flex-col gap-gutter lg:col-span-4">
              <MembershipDonut mix={data.mix} />
              <AttendanceSnapshotCard attendance={data.attendance} />
            </div>
          </div>

          <RecentActivityCard rows={data.activity} />
        </div>
      )}
    </>
  )
}
