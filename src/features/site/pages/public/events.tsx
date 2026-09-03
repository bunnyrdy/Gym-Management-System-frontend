import { useState } from 'react'
import { ROUTES } from '@/constants/routes'
import { usePublicSite, usePublicEvents } from '@/features/site/hooks/use-site'
import { useDocumentTitle } from '@/features/site/hooks/use-document-title'
import {
  Section, SectionHeading, CtaBanner, SiteEmpty,
} from '@/features/site/components/site-primitives'
import { EventCard } from '@/features/site/components/site-cards'
import { SiteLoading, SiteError } from '@/features/site/components/site-states'
import { Button } from '@/components/ui/button'

/**
 * Upcoming events.
 *
 * "Upcoming" is decided on the server against the branch's own calendar, not
 * the visitor's clock: between midnight and 05:30 IST a UTC-derived date still
 * says yesterday, which would leave this morning's 6 AM class listed as past
 * for anyone who opened the page early.
 */
export default function SiteEventsPage() {
  const [page, setPage] = useState(1)
  const { data: site } = usePublicSite()
  const { data, isLoading, isError, refetch } = usePublicEvents(page)

  useDocumentTitle(site ? `Events — ${site.gymName}` : 'Events')

  if (isLoading && !data) return <SiteLoading />
  if (isError || !data) return <SiteError onRetry={() => refetch()} />

  const hasMore = page < data.totalPages

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Events"
          title="Upcoming Fitness Events"
          lede="Push your limits, learn new skills and connect with people training towards the same things."
        />

        {data.items.length === 0 ? (
          <div className="mt-lg">
            <SiteEmpty>No events are scheduled right now. Check back soon.</SiteEmpty>
          </div>
        ) : (
          <>
            <div className="mt-lg grid gap-stack-md md:grid-cols-2 lg:grid-cols-3">
              {data.items.map((event, index) => (
                <EventCard key={`${event.title}-${event.eventDate}-${index}`} event={event} />
              ))}
            </div>

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
        title="Be Part of Our Fitness Community"
        body="Don't train alone. Join a community of people focused on continuous improvement."
        primaryLabel="Join The Community"
        primaryTo={ROUTES.SITE_CONTACT}
        secondaryLabel="View Plans"
        secondaryTo={ROUTES.SITE_PLANS}
        imageUrl={site?.hero.imageUrl}
      />
    </>
  )
}
