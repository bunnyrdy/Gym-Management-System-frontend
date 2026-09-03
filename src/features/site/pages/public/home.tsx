import {
  Dumbbell, GraduationCap, Clock, LineChart, Apple, Sparkles,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { usePublicSite } from '@/features/site/hooks/use-site'
import { useDocumentTitle } from '@/features/site/hooks/use-document-title'
import { SiteHero } from '@/features/site/components/site-hero'
import {
  Section, SectionHeading, CtaBanner, MediaTile, SiteCard,
} from '@/features/site/components/site-primitives'
import { SiteLoading, SiteError } from '@/features/site/components/site-states'

/**
 * The marketing home page.
 *
 * The five "Why Choose Our Gym" cards below are static copy, and deliberately
 * so. They are in the Stitch design but not in the CMS requirements, and a
 * table nobody writes to is a migration, a screen and a test for nothing. When
 * the owner asks to edit them, they become `site_features`.
 *
 * Everything else on this page comes from one query. The About collage, the
 * gallery preview and the hero counters all describe the same instant, which
 * is the whole reason the API composes them into a single response.
 */
const FEATURES = [
  {
    icon: Dumbbell,
    title: 'Premium Equipment',
    body: 'Train with the latest high-performance gear designed for safety, ergonomics and maximum muscular engagement.',
  },
  {
    icon: GraduationCap,
    title: 'Certified Trainers',
    body: 'Our coaching staff brings proven methodologies and deep physiological knowledge, so you progress safely.',
  },
  {
    icon: LineChart,
    title: 'Personalised Training',
    body: 'Programming tailored to your biomechanics, your lifestyle and the goals you actually care about.',
  },
  {
    icon: Apple,
    title: 'Nutrition Guidance',
    body: 'Dietary frameworks that fuel your workouts and support recovery and body composition.',
  },
  {
    icon: Clock,
    title: 'Flexible Timings',
    body: 'Access that fits a demanding schedule, early morning through late evening.',
  },
  {
    icon: Sparkles,
    title: 'Clean & Hygienic',
    body: 'A pristine training environment maintained with rigorous sanitation protocols.',
  },
] as const

export default function SiteHomePage() {
  const { data, isLoading, isError, refetch } = usePublicSite()
  useDocumentTitle(data ? `${data.gymName} — ${data.tagline ?? 'Gym'}` : 'Loading')

  if (isLoading) return <SiteLoading />
  if (isError || !data) return <SiteError onRetry={() => refetch()} />

  return (
    <>
      <SiteHero hero={data.hero} gymName={data.gymName} />

      {(data.aboutTitle || data.aboutDescription || data.aboutMedia.length > 0) && (
        <Section>
          <div className="grid gap-lg lg:grid-cols-2 lg:items-center">
            {data.aboutMedia.length > 0 && (
              // The orange plate sits behind the collage, offset down-left. It
              // is the cheapest way to stop three rectangles reading as a
              // spreadsheet, and it ties the section to the brand.
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute -bottom-4 -left-4 h-full w-full rounded-lg bg-primary-container/15"
                />
                <div className="relative grid grid-cols-2 gap-stack-md">
                  {/* The first photo runs full height beside a stack of the
                      next two — the collage in the Stitch About screen. */}
                  <MediaTile item={data.aboutMedia[0]} className="row-span-2 h-full" />
                  {data.aboutMedia.slice(1, 3).map((item) => (
                    <MediaTile key={item.url} item={item} className="aspect-square" />
                  ))}
                </div>
              </div>
            )}

            <div>
              <SectionHeading
                eyebrow="About Us"
                title={data.aboutTitle ?? 'More Than a Gym'}
                lede={data.aboutDescription}
              />
            </div>
          </div>
        </Section>
      )}

      <Section tone="container">
        <SectionHeading
          eyebrow="Features"
          title="Why Choose Our Gym?"
          lede="An elite training environment engineered to optimise every minute of your workout."
          align="center"
        />

        <div className="mt-lg grid gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, index) => {
            // Alternating filled and tinted chips. Six identical cards in a
            // grid read as a wall; alternating the chip gives the eye a rhythm
            // to follow without introducing a second colour.
            const filled = index % 2 === 0
            return (
              <SiteCard key={title} className="p-md">
                <span
                  className={
                    filled
                      ? 'grid h-12 w-12 place-items-center rounded-full bg-primary-container shadow-soft-lift'
                      : 'grid h-12 w-12 place-items-center rounded-full bg-primary-container/12 ring-1 ring-primary-container/30'
                  }
                >
                  <Icon
                    className={filled ? 'h-5 w-5 text-on-primary' : 'h-5 w-5 text-primary-container'}
                    strokeWidth={1.5}
                  />
                </span>
                <h3 className="mt-stack-md text-headline-md text-on-surface">{title}</h3>
                <p className="mt-stack-sm text-body-md text-on-surface-variant">{body}</p>
              </SiteCard>
            )
          })}
        </div>
      </Section>

      {data.gallery.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="Gallery"
            title="Inside the Gym"
            lede="A look at the floor, the equipment and the people who train here."
          />

          {/* A varied mosaic rather than a uniform 3-up grid: every fourth
              tile runs two columns wide and every seventh two rows tall, so a
              dozen photographs read as a composition instead of a contact
              sheet. `auto-rows` keeps the row height fixed so the spans line
              up whatever the source aspect ratios are.

              `grid-flow-dense` is what stops the wide and tall tiles from
              leaving holes: without it a span that will not fit the remaining
              columns pushes to the next row and leaves a gap behind it. */}
          <div className="mt-lg grid auto-rows-[180px] grid-flow-dense gap-stack-md sm:grid-cols-2 lg:auto-rows-[220px] lg:grid-cols-4">
            {data.gallery.map((item, index) => (
              <MediaTile
                key={item.url}
                item={item}
                className={
                  index % 7 === 0
                    ? 'row-span-2 lg:col-span-2'
                    : index % 4 === 3
                      ? 'lg:col-span-2'
                      : ''
                }
              />
            ))}
          </div>
        </Section>
      )}

      <CtaBanner
        title="Ready to Start Your Fitness Journey?"
        body="Join our growing community and reach your goals with expert guidance and premium facilities."
        primaryLabel="View Membership Plans"
        primaryTo={ROUTES.SITE_PLANS}
        secondaryLabel="Contact Us"
        secondaryTo={ROUTES.SITE_CONTACT}
        // The hero photograph again, this time under a warmer scrim. Reusing it
        // costs nothing — it is already in cache by the time anyone scrolls
        // this far — and the page closes on the same image it opened with.
        imageUrl={data.hero.imageUrl}
      />
    </>
  )
}
