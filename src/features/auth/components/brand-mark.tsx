import { Logo } from '@/components/brand/logo'

/**
 * Logo lockup at the top of the auth card — the right-hand panel of every auth
 * screen. The artwork already contains the "STEEL FLEX" wordmark, so there is
 * no separate text beside it; the tagline stays as a caption.
 *
 * V1 hardcodes the name; the Settings module reads it from `tenants.name` and
 * will pass it in as a prop.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-xs ${className}`}>
      <Logo variant="full" plateClassName="w-full max-w-[248px] p-3" />
      <span className="font-mono text-label-md text-on-surface-variant">
        Gym Management
      </span>
    </div>
  )
}
