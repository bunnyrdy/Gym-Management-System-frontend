import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  UserCog,
  CalendarCheck,
  Settings,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { authService } from '@/features/auth/services/auth.service'
import { Avatar } from '@/components/ui/avatar'
import { BackButton } from '@/components/ui/back-button'
import { Logo } from '@/components/brand/logo'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

/**
 * Sidebar + top bar shell shared by every signed-in screen (see the SideNavBar
 * and TopAppBar blocks the design files repeat verbatim). Routes that are not
 * built yet are rendered as disabled items rather than dead links.
 *
 * The nav has two independent open/closed states, because the two breakpoints
 * want different things:
 *
 *   * below `lg` it is an off-canvas drawer over a scrim — there is no room to
 *     keep it on screen, so it opens on demand and closes on navigation;
 *   * at `lg` and up it collapses to an icon rail instead of disappearing, so
 *     the user keeps their bearings and the content gains ~11rem.
 *
 * The rail choice persists in localStorage: it is a per-person working
 * preference, and having it reset on every reload is what makes collapsible
 * navigation annoying.
 */
// const NAV = [
//   { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
//   { label: 'Members', icon: Users, to: ROUTES.MEMBERS },
//   { label: 'Membership Plans', icon: CreditCard, to: ROUTES.PLANS },
//   { label: 'Trainers', icon: Dumbbell, to: ROUTES.TRAINERS },
//   { label: 'Receptionists', icon: UserCog, to: ROUTES.RECEPTIONISTS },
//   { label: 'Attendance', icon: CalendarCheck, to: ROUTES.ATTENDANCE },
//   { label: 'Website', icon: Globe, to: ROUTES.WEBSITE },
//    { label: 'Settings', icon: Settings, to: ROUTES.SETTINGS },
// ] as const
interface NavItem {
  label: string
  icon: LucideIcon
  to: string
}

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  { label: 'Members', icon: Users, to: ROUTES.MEMBERS },
  { label: 'Membership Plans', icon: CreditCard, to: ROUTES.PLANS },
  { label: 'Trainers', icon: Dumbbell, to: ROUTES.TRAINERS },
  { label: 'Receptionists', icon: UserCog, to: ROUTES.RECEPTIONISTS },
  { label: 'Attendance', icon: CalendarCheck, to: ROUTES.ATTENDANCE },
  { label: 'Website', icon: Globe, to: ROUTES.WEBSITE },
]
const COLLAPSED_KEY = 'steelflex.nav.collapsed'

function readCollapsed(): boolean {
  // Private-mode Safari throws on localStorage rather than returning null, and
  // the shell must still render. Expanded is the safe default either way.
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

export function AppShell() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {
        // A preference we could not persist is not worth failing a click over.
      }
      return next
    })
  }, [])

  // Navigating with the drawer open would otherwise leave it covering the page
  // the user just asked for.
  useEffect(() => setDrawerOpen(false), [pathname])

  // Escape closes the drawer, and while it is open the page behind it must not
  // scroll — otherwise the scrim moves with the content under it.
  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  const handleLogout = async () => {
    // Revoke server-side first, but clear locally no matter what — a network
    // failure must not leave someone stranded in a signed-in shell.
    try {
      await authService.logout()
    } finally {
      logout()
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }

  const itemClass = (active: boolean) =>
    cn(
      'mx-2 my-1 flex items-center gap-sm rounded-md py-3 font-mono text-label-md transition-colors',
      collapsed ? 'justify-center px-0' : 'px-4',
      active
        ? 'bg-primary-container font-bold text-on-primary'
        : 'text-secondary-fixed-dim hover:bg-surface-variant/10 hover:text-inverse-on-surface',
    )

  const disabledClass = cn(
    'mx-2 my-1 flex cursor-not-allowed items-center gap-sm rounded-md py-3 font-mono text-label-md text-secondary-fixed-dim/40',
    collapsed ? 'justify-center px-0' : 'px-4',
  )

  // `hidden` on a collapsed label rather than dropping the node: screen readers
  // still need the accessible name, which the icon alone does not provide.
  const label = (text: string) => (
    <span className={collapsed ? 'sr-only' : undefined}>{text}</span>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Scrim. Only below `lg`, where the nav is a drawer rather than a column. */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-inverse-surface/60 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      )}

      <nav
        id="app-nav"
        aria-label="Main"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col bg-inverse-surface py-md transition-[width,transform] duration-200 ease-out',
          collapsed ? 'w-20' : 'w-64',
          // Off-canvas below `lg`; always on-canvas from `lg` up.
          drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('mb-xl flex flex-col items-center', collapsed ? 'px-2' : 'px-md')}>
          {/* The wordmark is unreadable in a 5rem rail, so the rail gets the
              two-figure mark instead of a shrunken lockup. */}
          {collapsed ? (
            <Logo variant="mark" plateClassName="h-14 w-14 p-1" />
          ) : (
            <>
              <Logo variant="full" plateClassName="w-full max-w-[190px] p-2" />
              <div className="mt-xs font-mono text-label-md text-secondary-fixed-dim">
                Gym Management
              </div>
            </>
          )}

          {/* Drawer close affordance — the scrim also closes it, but a visible
              control is what a keyboard user can reach. */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="absolute right-2 top-2 rounded-md p-2 text-secondary-fixed-dim transition-colors hover:bg-surface-variant/10 hover:text-inverse-on-surface lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {NAV.map(({ label: text, icon: Icon, to }) =>
            to ? (
              <NavLink
                key={text}
                to={to}
                title={collapsed ? text : undefined}
                className={({ isActive }) => itemClass(isActive)}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label(text)}
              </NavLink>
            ) : (
              <span
                key={text}
                aria-disabled
                title={collapsed ? `${text} — coming soon` : 'Coming soon'}
                className={disabledClass}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label(text)}
              </span>
            ),
          )}
        </div>

        <div className="mt-auto border-t border-secondary-fixed-dim/20 pt-md">
          <span
            aria-disabled
            title={collapsed ? 'Settings — coming soon' : 'Coming soon'}
            className={disabledClass}
          >
            <Settings className="h-5 w-5 shrink-0" aria-hidden />
            {label('Settings')}
          </span>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'mx-2 my-1 flex w-[calc(100%-1rem)] items-center gap-sm rounded-md py-3 font-mono text-label-md text-secondary-fixed-dim transition-colors hover:bg-surface-variant/10 hover:text-inverse-on-surface',
              collapsed ? 'justify-center px-0' : 'px-4',
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            {label('Logout')}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          // min-w-0 is load-bearing. A flex item defaults to min-width:auto,
          // so this column refuses to shrink below its widest child — one wide
          // table and the whole document scrolls sideways, top bar and all,
          // instead of the table scrolling inside its own overflow-x-auto box.
          'flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out',
          collapsed ? 'lg:ml-20' : 'lg:ml-64',
        )}
      >
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between gap-sm border-b border-outline-variant bg-surface px-lg">
          <div className="flex items-center gap-xs">
            {/* Below `lg` this opens the drawer; from `lg` up it toggles the
                rail. Two buttons rather than one that branches on a media
                query — the breakpoint stays in CSS, where it can't disagree
                with the layout. */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              aria-controls="app-nav"
              aria-expanded={drawerOpen}
              className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-controls="app-nav"
              aria-expanded={!collapsed}
              className="hidden rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface lg:block"
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" aria-hidden />
              ) : (
                <PanelLeftClose className="h-5 w-5" aria-hidden />
              )}
            </button>

            {/* The dashboard is the root of the signed-in app — there is
                nothing above it to go back to. */}
            {pathname !== ROUTES.DASHBOARD && <BackButton />}
          </div>

          <div className="flex items-center gap-sm">
            <div className="hidden flex-col items-end sm:flex">
              <span className="font-mono text-label-sm font-bold text-on-surface">{user?.email}</span>
              <span className="font-mono text-label-sm capitalize text-on-surface-variant">
                {user?.role}
              </span>
            </div>
            <Avatar name={user?.email ?? '?'} className="h-10 w-10" />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-lg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
