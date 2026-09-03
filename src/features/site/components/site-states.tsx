import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'

/**
 * The loading and error states every public page shares.
 *
 * The error copy is deliberately plain. A visitor is not staff: "Could not load
 * the page" is actionable, a status code is not, and the real detail is already
 * in the API log under the trace id the response carried.
 */
export function SiteLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Spinner size="lg" className="text-primary-container" />
    </div>
  )
}

export function SiteError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-stack-md px-margin-mobile text-center">
      <h1 className="text-headline-md text-on-surface">We could not load this page</h1>
      <p className="text-body-md text-on-surface-variant">
        Something went wrong at our end. Please try again in a moment.
      </p>
      <Button variant="primary" size="md" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
