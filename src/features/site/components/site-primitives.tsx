import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { assetUrl } from '@/services/api'
import type { PublicMediaItem } from '@/features/site/types/site'

/**
 * The handful of shapes every public page repeats: the section wrapper, the
 * eyebrow-plus-heading block, the CTA banner and a media tile.
 *
 * They live in one file because each is a dozen lines and they are only ever
 * used together. Five files of one export each would be five imports on every
 * page for no extra clarity.
 *
 * Everything here is composed from `index.css` tokens — `section-gap`,
 * `container-site`, `primary-container`. No literal colour, radius or type size
 * appears below, which is the rule that keeps the marketing pages on-theme as
 * they grow.
 */

/** The page-width column with the marketing rhythm: 1280px, 120px/64px gaps. */
export function Section({
  children,
  className,
  tone = 'surface',
  imageUrl,
  id,
}: {
  children: ReactNode
  className?: string
  /** Alternating bands are what give the page its rhythm — DESIGN.md > Layout. */
  tone?: 'surface' | 'container' | 'inverse' | 'warm' | 'photo'
  /** Only read by tone="photo". A full-bleed background behind an orange scrim. */
  imageUrl?: string | null
  id?: string
}) {
  const tones = {
    surface: 'bg-surface',
    container: 'bg-surface-container-low',
    inverse: 'bg-inverse-surface text-inverse-on-surface',
    // A soft orange wash. Carries a band without the weight of a full dark
    // section — used behind the plans, where four white cards on white read flat.
    warm: 'bg-gradient-to-b from-primary-fixed/40 via-surface-container-low to-surface',
    photo: 'bg-inverse-surface text-inverse-on-surface',
  }

  const photo = tone === 'photo'
  const background = photo ? assetUrl(imageUrl) : null

  return (
    <section id={id} className={cn('relative isolate w-full overflow-hidden', tones[tone])}>
      {photo && (
        <>
          {background && (
            <img
              src={background}
              alt=""
              loading="lazy"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
          )}
          {/* Same two-layer treatment as the hero: readability first, then the
              brand wash. Without artwork the gradient carries the band alone. */}
          <div className="absolute inset-0 -z-10 bg-inverse-surface/80" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/60 via-transparent to-primary/30" />
        </>
      )}
      <div
        className={cn(
          'mx-auto w-full max-w-container-site px-margin-mobile py-section-gap-mobile md:px-gutter md:py-section-gap',
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}

/**
 * Eyebrow, headline, lede. Left-aligned by default because DESIGN.md reserves
 * centred layouts for hero introductions and closing CTAs.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  inverse = false,
}: {
  eyebrow?: string
  title: string
  lede?: string | null
  align?: 'left' | 'center'
  inverse?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-stack-md',
        align === 'center' && 'items-center text-center',
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-label-bold uppercase',
            inverse
              ? 'bg-inverse-on-surface/15 text-inverse-on-surface'
              : 'bg-primary-container/12 text-primary-container',
          )}
        >
          {/* A small orange dot ahead of the label. Cheap, and it stops the
              eyebrow reading as a disabled chip. */}
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              inverse ? 'bg-inverse-on-surface' : 'bg-primary-container',
            )}
          />
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          'text-display-xl-mobile md:text-display-xl',
          inverse ? 'text-inverse-on-surface' : 'text-on-surface',
        )}
      >
        {title}
      </h2>

      {lede && (
        <p
          className={cn(
            'max-w-2xl text-body-lg',
            inverse ? 'text-inverse-on-surface/80' : 'text-on-surface-variant',
          )}
        >
          {lede}
        </p>
      )}
    </div>
  )
}

/**
 * The closing "Ready to…" band. Two buttons, the second optional.
 *
 * Pass `imageUrl` and it becomes a full-bleed photograph under an orange scrim,
 * which is what turns the bottom of every page from a grey slab into the most
 * committed-looking thing on the screen. Without one it falls back to the flat
 * inverse surface, so a gym with no gallery still gets a usable band.
 */
export function CtaBanner({
  title,
  body,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  imageUrl,
}: {
  title: string
  body: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
  imageUrl?: string | null
}) {
  return (
    <Section tone={imageUrl ? 'photo' : 'inverse'} imageUrl={imageUrl}>
      <div className="flex flex-col items-center gap-stack-lg text-center">
        <h2 className="max-w-3xl text-display-xl-mobile text-inverse-on-surface md:text-display-xl">
          {title}
        </h2>
        <p className="max-w-2xl text-body-lg text-inverse-on-surface/80">{body}</p>

        <div className="flex flex-col gap-stack-md sm:flex-row">
          <Link
            to={primaryTo}
            className="inline-flex items-center justify-center rounded-md bg-primary-container px-8 py-3.5 text-label-md font-semibold uppercase tracking-wide text-on-primary shadow-defined-lift transition-all hover:-translate-y-0.5 hover:bg-primary"
          >
            {primaryLabel}
          </Link>

          {secondaryLabel && secondaryTo && (
            <Link
              to={secondaryTo}
              className="inline-flex items-center justify-center rounded-md border-[1.5px] border-inverse-on-surface/60 bg-inverse-surface/30 px-8 py-3.5 text-label-md font-semibold uppercase tracking-wide text-inverse-on-surface backdrop-blur transition-all hover:-translate-y-0.5 hover:border-inverse-on-surface hover:bg-inverse-on-surface hover:text-inverse-surface"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </Section>
  )
}

/**
 * One gallery item, image or video.
 *
 * `preload="none"` and a poster are what stop a gallery of ten clips from
 * pulling tens of megabytes on a phone before anyone presses play. `controls`
 * rather than autoplay: a marketing page that starts making noise is a page
 * people close.
 */
export function MediaTile({ item, className }: { item: PublicMediaItem; className?: string }) {
  const src = assetUrl(item.url) ?? undefined

  return (
    <figure
      className={cn('group relative overflow-hidden rounded-lg bg-surface-container', className)}
    >
      {item.kind === 'video' ? (
        <video
          src={src}
          poster={assetUrl(item.posterUrl) ?? undefined}
          controls
          preload="none"
          className="h-full w-full object-cover"
        />
      ) : (
        <img
          src={src}
          alt={item.caption ?? ''}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* The caption overlays the image rather than sitting under it. Two
          reasons: the tile is sized by an aspect ratio, so a caption below it
          would either overflow or force every tile taller than its photo; and a
          gradient foot reads as part of the picture instead of as a label
          stapled to the bottom. Videos keep their own controls, so only images
          get the overlay. */}
      {item.caption && item.kind === 'image' && (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-inverse-surface/90 to-transparent px-4 pb-3 pt-8 text-label-md font-medium text-inverse-on-surface">
          {item.caption}
        </figcaption>
      )}
    </figure>
  )
}

/** The white card every content grid uses. DESIGN.md > Elevation. */
export function SiteCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-surface-container-lowest shadow-soft-lift transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-defined-lift hover:ring-1 hover:ring-primary-container/30',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** The shared empty state. A public page must never render a bare blank band. */
export function SiteEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-outline-variant px-6 py-12 text-center text-body-md text-on-surface-variant">
      {children}
    </p>
  )
}
