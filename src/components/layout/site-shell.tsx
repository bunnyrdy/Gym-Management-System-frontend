import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { Logo } from '@/components/brand/logo'
import { usePublicSite } from '@/features/site/hooks/use-site'
import { cn } from '@/utils/cn'

/**
 * The chrome every public page inherits: a sticky header, a mobile drawer and
 * the footer. The counterpart to AppShell, and deliberately a separate
 * component rather than a mode on it — a marketing header has no back button,
 * no rail, no user menu and no localStorage state, and folding two of those
 * into one component is how both end up full of `isPublic &&`.
 *
 * It reads the same `usePublicSite` query the pages do, so the gym's name in
 * the header and the footer text come from the CMS rather than being hardcoded
 * a third time. React Query dedupes the call.
 */
const NAV = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'Plans', to: ROUTES.SITE_PLANS },
  { label: 'Transformations', to: ROUTES.SITE_TRANSFORMATIONS },
  { label: 'Events', to: ROUTES.SITE_EVENTS },
  { label: 'Contact', to: ROUTES.SITE_CONTACT },
] as const

export function SiteShell() {
  const [open, setOpen] = useState(false)
  const { data } = usePublicSite()

  // Navigating with the drawer open leaves it covering the page it just
  // opened. Closed from the tap that navigates rather than from an effect on
  // the pathname — an effect would re-render twice for every navigation, and
  // the tap is the event that actually caused the change.
  const close = () => setOpen(false)

  const gymName = data?.gymName ?? 'Steel Flex'
  const year = new Date().getFullYear()

  const linkClass = (isActive: boolean) =>
    cn(
      'text-body-md transition-colors',
      isActive
        ? 'font-semibold text-primary-container'
        : 'text-on-surface-variant hover:text-on-surface',
    )

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 border-b border-outline-variant/40 bg-surface/95 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto flex w-full max-w-container-site items-center justify-between px-margin-mobile py-stack-md md:px-gutter"
        >
          <Link to={ROUTES.HOME} className="flex items-center gap-stack-sm">
            <Logo variant="mark" plateClassName="h-10 w-10 p-1" />
            <span className="text-headline-md font-bold text-on-surface">{gymName}</span>
          </Link>

          <div className="hidden items-center gap-lg lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.HOME}
                className={({ isActive }) => linkClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-stack-sm">
            <Link
              to={ROUTES.LOGIN}
              className="hidden rounded-md bg-primary-container px-6 py-2.5 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary sm:inline-flex"
            >
              Member Login
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-nav-drawer"
              className="grid h-10 w-10 place-items-center rounded-md text-on-surface hover:bg-surface-container-low lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div
            id="site-nav-drawer"
            className="border-t border-outline-variant/40 bg-surface px-margin-mobile pb-stack-lg lg:hidden"
          >
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === ROUTES.HOME}
                    onClick={close}
                    className={({ isActive }) =>
                      cn('block py-stack-md', linkClass(isActive))
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to={ROUTES.LOGIN}
                  onClick={close}
                  className="mt-stack-md inline-flex w-full items-center justify-center rounded-md bg-primary-container px-6 py-3 text-label-md font-semibold text-on-primary"
                >
                  Member Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* min-w-0 for the same reason AppShell's content column carries it: a
          flex child defaults to min-width:auto and refuses to shrink below its
          widest descendant, so one wide row would scroll the whole document. */}
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-outline-variant/40 bg-surface-container-low">
        <div className="mx-auto flex w-full max-w-container-site flex-col gap-stack-md px-margin-mobile py-lg md:flex-row md:items-center md:justify-between md:px-gutter">
          <Link to={ROUTES.HOME} className="flex items-center gap-stack-sm">
            <Logo variant="mark" plateClassName="h-8 w-8 p-0.5" />
            <span className="text-body-md font-semibold text-on-surface">{gymName}</span>
          </Link>

          <p className="text-label-md text-on-surface-variant">
            {data?.footerText ?? `© ${year} ${gymName}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  )
}
