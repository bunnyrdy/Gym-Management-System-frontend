import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { assetUrl } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import type { PublicHero } from '@/features/site/types/site'

/**
 * The hero.
 *
 * There is no Stitch design for this block — `public page/` ships About, Plans
 * and Transformations screens and no home page — so it is built from the design
 * system rather than traced: display-xl headline, orange CTA, a full-bleed
 * image behind an inverse-surface scrim, and the two stat tiles the
 * requirements ask for.
 *
 * Three things it handles that a hardcoded hero would not:
 *
 *  * NO ARTWORK. An unconfigured gym gets the ambient wash instead of a broken
 *    image, and the type stays readable because the scrim is painted on the
 *    container, not on the photo.
 *  * NO NUMBERS. `activeMembers` of 0 and a null `yearsOfExperience` both hide
 *    their tile rather than publishing "0 Years of Experience", which reads
 *    worse than saying nothing.
 *  * A VIDEO. Click-to-play, never autoplay: the poster is the hero image, so
 *    nothing downloads until someone asks for it.
 */
export function SiteHero({ hero, gymName }: { hero: PublicHero; gymName: string }) {
  const [playing, setPlaying] = useState(false)

  const image = assetUrl(hero.imageUrl)
  const video = assetUrl(hero.videoUrl)

  const stats = [
    hero.activeMembers > 0
      ? { value: `${hero.activeMembers}+`, label: 'Active Members' }
      : null,
    hero.yearsOfExperience !== null && hero.yearsOfExperience > 0
      ? { value: `${hero.yearsOfExperience}`, label: 'Years of Experience' }
      : null,
  ].filter((s): s is { value: string; label: string } => s !== null)

  return (
    <section className="relative isolate w-full overflow-hidden bg-inverse-surface">
      {image ? (
        <>
          <img
            src={image}
            alt=""
            // The hero is the largest paint on the page and the one image that
            // must not lazy-load — it is what the visitor is waiting for.
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* Two scrims, not one.
              The first is the readability layer: type over an uncontrolled
              photograph is the easiest way to ship an unreadable page.
              The second is the brand layer — a warm diagonal wash so the photo
              reads as ours rather than as stock dropped behind grey. Both are
              composed from theme tokens; no literal colour appears here. */}
          <div className="absolute inset-0 -z-10 bg-inverse-surface/75" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/50 via-transparent to-inverse-surface/60" />
        </>
      ) : (
        // No artwork yet: the gradient carries the section on its own rather
        // than leaving a flat charcoal slab.
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-inverse-surface via-inverse-surface to-primary/60" />
      )}

      <div className="mx-auto flex w-full max-w-container-site flex-col items-center gap-stack-lg px-margin-mobile py-section-gap-mobile text-center md:px-gutter md:py-section-gap">
        <span className="rounded-full bg-primary-container px-5 py-2 text-label-bold uppercase text-on-primary shadow-defined-lift">
          {gymName}
        </span>

        <h1 className="max-w-4xl text-display-xl-mobile text-inverse-on-surface md:text-display-xl">
          {hero.headline}
        </h1>

        {hero.subtext && (
          <p className="max-w-2xl text-body-lg text-inverse-on-surface/85">{hero.subtext}</p>
        )}

        <div className="flex flex-col gap-stack-md sm:flex-row">
          <Link
            to={ROUTES.SITE_PLANS}
            className="inline-flex items-center justify-center rounded-md bg-primary-container px-8 py-3.5 text-label-md font-semibold uppercase tracking-wide text-on-primary shadow-defined-lift transition-all hover:-translate-y-0.5 hover:bg-primary"
          >
            View Membership Plans
          </Link>
          <Link
            to={ROUTES.SITE_CONTACT}
            className="inline-flex items-center justify-center rounded-md border-[1.5px] border-inverse-on-surface/60 bg-inverse-surface/30 px-8 py-3.5 text-label-md font-semibold uppercase tracking-wide text-inverse-on-surface backdrop-blur transition-all hover:-translate-y-0.5 hover:border-inverse-on-surface hover:bg-inverse-on-surface hover:text-inverse-surface"
          >
            Contact Us
          </Link>
        </div>

        {stats.length > 0 && (
          <dl className="mt-stack-lg flex flex-wrap items-center justify-center gap-stack-md">
            {stats.map((stat) => (
              // The value reads first and the label under it, so the <dd> is
              // ordered before its <dt> visually. `flex-col-reverse` keeps the
              // DOM order a definition list requires while painting it the way
              // the design shows.
              <div
                key={stat.label}
                className="flex min-w-[168px] flex-col-reverse items-center rounded-lg border border-primary-container/40 bg-inverse-surface/40 px-6 py-4 backdrop-blur"
              >
                <dd className="text-display-xl-mobile font-bold leading-none text-primary-container">
                  {stat.value}
                </dd>
                <dt className="mb-1 text-label-bold uppercase text-inverse-on-surface/70">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        )}

        {video && (
          <div className="mt-stack-lg w-full max-w-4xl overflow-hidden rounded-xl shadow-defined-lift ring-1 ring-primary-container/30">
            {playing ? (
              <video
                src={video}
                poster={image ?? undefined}
                controls
                autoPlay
                className="h-full w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group relative grid h-full w-full place-items-center bg-surface-container-highest py-section-gap-mobile"
                style={
                  image
                    ? { backgroundImage: `url(${image})`, backgroundSize: 'cover',
                        backgroundPosition: 'center' }
                    : undefined
                }
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-container ring-8 ring-primary-container/25 transition-transform group-hover:scale-110">
                  <Play className="h-7 w-7 fill-on-primary text-on-primary" />
                </span>
                <span className="mt-stack-md text-headline-md text-inverse-on-surface drop-shadow">
                  Take a virtual tour
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
