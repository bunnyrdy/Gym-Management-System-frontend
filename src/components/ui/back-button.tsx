import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'

/**
 * Go back one step — with a fallback, which is the whole reason this is a
 * component and not a bare `navigate(-1)` button.
 *
 * `navigate(-1)` is only correct when there *is* a previous entry inside the
 * app. On a deep link, a page opened in a new tab, or the first screen after a
 * login redirect, the previous entry is another site (or nothing), and going
 * back throws the user out of the app. React Router stamps an incrementing
 * `idx` onto history state, so `idx > 0` is a reliable test for "we navigated
 * here from somewhere in this app".
 *
 * When there is no in-app history, we walk one segment up the URL instead
 * — /staff/receptionists/12 -> /staff/receptionists — which is what the user
 * meant by "back" anyway, and never leaves the app.
 */
export function BackButton({
  fallback,
  label = 'Back',
  className,
}: {
  /** Where to go when there is no in-app history. Defaults to the parent path. */
  fallback?: string
  label?: string
  className?: string
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const parentPath = () => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length <= 1) return ROUTES.DASHBOARD
    return `/${segments.slice(0, -1).join('/')}`
  }

  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) {
      navigate(-1)
      return
    }
    navigate(fallback ?? parentPath(), { replace: true })
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={label}
      className={cn(
        'flex items-center gap-xs rounded-md px-3 py-2 font-mono text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </button>
  )
}
