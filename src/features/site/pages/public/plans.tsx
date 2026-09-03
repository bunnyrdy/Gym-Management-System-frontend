import { ROUTES } from '@/constants/routes'
import { usePublicSite } from '@/features/site/hooks/use-site'
import { useDocumentTitle } from '@/features/site/hooks/use-document-title'
import {
  Section, SectionHeading, CtaBanner, SiteEmpty,
} from '@/features/site/components/site-primitives'
import { PlanCard, OfferCard } from '@/features/site/components/site-cards'
import { SiteLoading, SiteError } from '@/features/site/components/site-states'

/**
 * Membership plans and the current offers.
 *
 * The plans are the same rows the desk sells from — `PublicPlansAsync` reads
 * through `MembershipPlanService.Scoped()`, so an archived or deactivated plan
 * disappears from here the moment it disappears from the admin list. There is
 * no separate marketing copy of the price list to keep in step.
 *
 * The requirements ask for a horizontal slider. That is CSS scroll-snap here
 * rather than a carousel dependency: it is keyboard-accessible and
 * touch-native for free, and it degrades into a plain grid on a wide screen
 * where all four cards fit anyway.
 */
export default function SitePlansPage() {
  const { data, isLoading, isError, refetch } = usePublicSite()
  useDocumentTitle(data ? `Membership Plans — ${data.gymName}` : 'Membership Plans')

  if (isLoading) return <SiteLoading />
  if (isError || !data) return <SiteError onRetry={() => refetch()} />

  return (
    <>
      {/* A warm band behind the pricing row: four white cards on a white page
          read flat, and pricing is the one screen that has to feel confident. */}
      <Section tone="warm">
        <SectionHeading
          eyebrow="Membership Plans"
          title="Choose the Perfect Membership"
          lede="Plans designed for absolute performance. Transparent pricing, no hidden fees."
          align="center"
        />

        {data.plans.length === 0 ? (
          <div className="mt-lg">
            <SiteEmpty>Our plans are being updated. Please check back shortly.</SiteEmpty>
          </div>
        ) : (
          <div
            className={
              // Snap-scrolling row on small screens, a centred wrap once there
              // is room. `-mx-*`/`px-*` lets the first and last card bleed to
              // the screen edge while still snapping to the content column.
              //
              // Centred wrap rather than `grid-cols-4`: a gym with one or two
              // plans would otherwise get a lone card stranded at a quarter
              // width against three empty columns. Four or more still fill the
              // row, and the card keeps a fixed basis so they stay equal.
              'mt-lg flex snap-x snap-mandatory gap-stack-md overflow-x-auto pb-stack-md ' +
              '-mx-margin-mobile px-margin-mobile ' +
              'lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0'
            }
          >
            {data.plans.map((plan) => (
              <div key={plan.id} className="w-[280px] shrink-0 snap-start pt-3">
                <PlanCard plan={plan} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {data.offers.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="Offers"
            title="This Month's Exclusive Offers"
            lede="Limited-time promotions to kickstart your fitness journey."
            align="center"
          />

          <div className="mt-lg grid gap-stack-md md:grid-cols-3">
            {data.offers.map((offer) => (
              <OfferCard key={offer.title} offer={offer} />
            ))}
          </div>
        </Section>
      )}

      <CtaBanner
        title="Ready to Begin Your Fitness Journey?"
        body="Join a community dedicated to engineered excellence. Secure your membership today."
        primaryLabel="Join Now"
        primaryTo={ROUTES.SITE_CONTACT}
        secondaryLabel="Contact Us"
        secondaryTo={ROUTES.SITE_CONTACT}
        imageUrl={data.hero.imageUrl}
      />
    </>
  )
}
