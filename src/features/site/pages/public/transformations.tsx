import { useState } from 'react'
import { ROUTES } from '@/constants/routes'
import { usePublicSite, usePublicTransformations } from '@/features/site/hooks/use-site'
import { useDocumentTitle } from '@/features/site/hooks/use-document-title'
import {
  Section, SectionHeading, CtaBanner, SiteEmpty,
} from '@/features/site/components/site-primitives'
import { TransformationCard } from '@/features/site/components/site-cards'
import { SiteLoading, SiteError } from '@/features/site/components/site-states'
import { Button } from '@/components/ui/button'

/**
 * Success stories.
 *
 * Its own paged endpoint rather than the home payload, because the requirements
 * say "unlimited records" and a gym with three hundred stories must not ship
 * all of them to every phone that opens the page.
 *
 * Every row here has recorded consent — the API filters on
 * `consent_given_at IS NOT NULL` as well as `is_active`, and withdrawing
 * consent in the CMS takes the story down on the next load. Nothing on this
 * page can render an unconsented story even if one somehow had `is_active` set
 * by hand.
 */
export default function SiteTransformationsPage() {
  const [page, setPage] = useState(1)
  const { data: site } = usePublicSite()
  const { data, isLoading, isError, refetch } = usePublicTransformations(page)

  useDocumentTitle(site ? `Transformations — ${site.gymName}` : 'Transformations')

  if (isLoading && !data) return <SiteLoading />
  if (isError || !data) return <SiteError onRetry={() => refetch()} />

  const hasMore = page < data.totalPages

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Success Stories"
          title="Real Transformations. Real Results."
          lede="A systematic approach to fitness, and the measurable outcomes it delivers for the people who train here."
        />

        {data.items.length === 0 ? (
          <div className="mt-lg">
            <SiteEmpty>The first success stories are on their way.</SiteEmpty>
          </div>
        ) : (
          <>
            <div className="mt-lg grid gap-stack-md md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((item, index) => (
                <TransformationCard key={`${item.displayName}-${index}`} item={item} />
              ))}
            </div>

            {/* Plain paging rather than infinite scroll: a marketing page that
                hijacks the scrollbar is a page people cannot reach the footer
                of, and the footer is where the contact details are. */}
            {(hasMore || page > 1) && (
              <div className="mt-lg flex items-center justify-center gap-stack-md">
                <Button
                  variant="secondary"
                  size="md"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-label-md text-on-surface-variant">
                  Page {data.page} of {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Section>

      <CtaBanner
        title="Ready for Your Transformation?"
        body="Start building a stronger, leaner, more capable version of yourself with science-backed training."
        primaryLabel="View Membership Plans"
        primaryTo={ROUTES.SITE_PLANS}
        secondaryLabel="Contact Us"
        secondaryTo={ROUTES.SITE_CONTACT}
        imageUrl={site?.hero.imageUrl}
      />
    </>
  )
}
