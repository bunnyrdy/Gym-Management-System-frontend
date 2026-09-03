// lucide-react dropped its brand glyphs, so Instagram is drawn with the
// generic camera icon rather than pulling in a second icon package for one mark.
import { Mail, Phone, Camera, MessageCircle, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { usePublicSite } from '@/features/site/hooks/use-site'
import { useDocumentTitle } from '@/features/site/hooks/use-document-title'
import {
  Section, SectionHeading, CtaBanner, SiteCard, SiteEmpty,
} from '@/features/site/components/site-primitives'
import { SiteLoading, SiteError } from '@/features/site/components/site-states'

/**
 * Contact.
 *
 * Every card is a link that does the thing the requirements ask for: phone
 * dials, email opens the mail client, Instagram opens the profile, WhatsApp
 * opens a chat, the address opens Maps. A card with no value behind it is not
 * rendered at all rather than rendered dead — an empty "Email" tile tells a
 * visitor nothing except that the site is unfinished.
 *
 * The phone, email and address come from `branches`; Instagram, WhatsApp and
 * the Maps link from `site_settings`. Two sources, one card grid, and neither
 * value is duplicated between them.
 */
type Channel = {
  icon: LucideIcon
  label: string
  value: string
  href: string
  external: boolean
}

export default function SiteContactPage() {
  const { data, isLoading, isError, refetch } = usePublicSite()
  useDocumentTitle(data ? `Contact — ${data.gymName}` : 'Contact')

  if (isLoading) return <SiteLoading />
  if (isError || !data) return <SiteError onRetry={() => refetch()} />

  const c = data.contact

  // WhatsApp's click-to-chat wants digits only — no spaces, hyphens or plus.
  const whatsappDigits = c.whatsappNumber?.replace(/\D/g, '')

  const address = [c.addressLine1, c.addressLine2, c.city, c.state]
    .filter(Boolean)
    .join(', ')

  const channels: Channel[] = [
    c.phone && {
      icon: Phone, label: 'Phone', value: c.phone,
      href: `tel:${c.phone.replace(/\s/g, '')}`, external: false,
    },
    c.email && {
      icon: Mail, label: 'Email', value: c.email,
      href: `mailto:${c.email}`, external: false,
    },
    whatsappDigits && {
      icon: MessageCircle, label: 'WhatsApp', value: c.whatsappNumber!,
      href: `https://wa.me/${whatsappDigits}`, external: true,
    },
    c.instagramUrl && {
      icon: Camera, label: 'Instagram', value: 'Follow us',
      href: c.instagramUrl, external: true,
    },
    (c.mapsUrl || address) && {
      icon: MapPin, label: 'Location', value: address || 'Find us on the map',
      href: c.mapsUrl ?? `https://www.google.com/maps/search/${encodeURIComponent(address)}`,
      external: true,
    },
  ].filter((v): v is Channel => Boolean(v))

  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="Contact"
          title="Reach Out"
          lede="Questions about our facilities or programmes? We're here to help you start."
          align="center"
        />

        {channels.length === 0 ? (
          <div className="mt-lg">
            <SiteEmpty>Our contact details are being updated.</SiteEmpty>
          </div>
        ) : (
          <div className="mt-lg grid gap-stack-md sm:grid-cols-2 lg:grid-cols-3">
            {channels.map(({ icon: Icon, label, value, href, external }) => (
              <SiteCard key={label}>
                <a
                  href={href}
                  // noreferrer alongside noopener: without it the destination
                  // learns which page sent the visitor, and these are the gym's
                  // own outbound links, not an ad network's.
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex flex-col items-center gap-stack-sm p-md text-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-container/10">
                    <Icon className="h-5 w-5 text-primary-container" strokeWidth={1.5} />
                  </span>
                  <span className="text-headline-md text-on-surface">{label}</span>
                  <span className="text-body-md text-on-surface-variant">{value}</span>
                </a>
              </SiteCard>
            ))}
          </div>
        )}
      </Section>

      <CtaBanner
        title="Ready to Start?"
        body="Walk in, or get in touch and we'll show you around the floor."
        primaryLabel="View Membership Plans"
        primaryTo={ROUTES.SITE_PLANS}
        imageUrl={data.hero.imageUrl}
      />
    </>
  )
}
