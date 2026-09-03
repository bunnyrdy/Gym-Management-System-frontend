import { useState } from 'react'
import { cn } from '@/utils/cn'
import { assetUrl } from '@/services/api'

/** Initials from a full name — the fallback when there's no photo. */
export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  // Stored paths are relative to the API, not to whatever is serving this SPA.
  const resolved = assetUrl(src)

  return (
    <span
      className={cn(
        'grid place-items-center overflow-hidden rounded-full bg-surface-container-high',
        'font-mono text-label-md text-on-surface-variant select-none shrink-0',
        className,
      )}
    >
      {resolved && !failed ? (
        <img
          src={resolved}
          alt=""
          className="h-full w-full object-cover"
          // A dead or removed file falls back to initials instead of a broken icon.
          onError={() => setFailed(true)}
        />
      ) : (
        initialsOf(name) || '?'
      )}
    </span>
  )
}
