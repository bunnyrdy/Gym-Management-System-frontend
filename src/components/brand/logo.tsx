import { cn } from '@/utils/cn'

/**
 * The Steel Flex logo, in the two forms the artwork actually supports.
 *
 * The source file (`logos/favicon.png`) is a wide lockup — two figures over a
 * "STEEL FLEX" wordmark — drawn on a dark radial glow that is baked into the
 * image's alpha. Two consequences drive everything here:
 *
 *   1. The wordmark stops being legible below roughly 96px, so anywhere small
 *      (favicon, collapsed nav rail, avatars) gets `variant="mark"` — the two
 *      figures cropped square — and never the full lockup scaled down.
 *
 *   2. The baked glow is dark. On a light surface it reads as a grey smudge
 *      around the artwork, so the image always sits on a dark plate rather
 *      than directly on `bg-background`. That plate uses `inverse-surface`,
 *      the same token as the sidebar, so it looks deliberate rather than like
 *      a transparency bug.
 *
 * Both PNGs are generated from the source, not hand-cropped — see the
 * generation step recorded in `logos/README.md`.
 */
type LogoVariant = 'full' | 'mark'

const SRC: Record<LogoVariant, string> = {
  full: '/logo-full.png',
  mark: '/logo-mark.png',
}

export function Logo({
  variant = 'full',
  className,
  plateClassName,
}: {
  variant?: LogoVariant
  /** Sizes the image. */
  className?: string
  /** Sizes/styles the dark plate behind it. */
  plateClassName?: string
}) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden bg-inverse-surface',
        variant === 'mark' ? 'rounded-md' : 'rounded-lg',
        plateClassName,
      )}
    >
      <img
        src={SRC[variant]}
        alt="Steel Flex"
        // Decorative wherever a text lockup sits beside it; the alt above is
        // kept for the cases where the logo stands alone.
        className={cn('block h-auto w-full object-contain', className)}
        draggable={false}
      />
    </span>
  )
}
