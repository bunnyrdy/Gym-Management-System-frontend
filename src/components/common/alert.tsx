import { cn } from '@/utils/cn'

/**
 * Inline form-level message. `error` uses the error container tokens; `info`
 * uses the primary-fixed tint so a success/notice never reads as a failure.
 */
export function Alert({
  variant = 'error',
  children,
  className,
}: {
  variant?: 'error' | 'info'
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md p-3 text-body-md',
        variant === 'error'
          ? 'bg-error-container text-on-error-container'
          : 'bg-primary-fixed text-on-primary-fixed',
        className,
      )}
    >
      {children}
    </div>
  )
}
