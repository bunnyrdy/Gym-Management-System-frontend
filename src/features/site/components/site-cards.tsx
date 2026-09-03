import { Check, Clock, MapPin, Trophy, Timer } from 'lucide-react'
import { assetUrl } from '@/services/api'
import { formatPrice, CURRENCY_SYMBOL } from '@/utils/currency'
import { cn } from '@/utils/cn'
import { SiteCard } from '@/features/site/components/site-primitives'
import {
  pricingSuffix,
  eventDayParts,
  eventTimeLabel,
  type PublicPlan,
  type PublicOffer,
  type PublicTransformation,
  type PublicEvent,
} from '@/features/site/types/site'

/**
 * The four content cards the public pages render.
 *
 * Prices go through `utils/currency.ts` rather than a typed `₹`: the symbol,
 * the locale and the lakh grouping live in one file, and a rupee sign written
 * into a component is the same class of bug as a literal hex colour.
 * `formatPrice` rather than `formatAmount` — a price card shows "₹1,100", not
 * the "₹1,100.00" that belongs on a receipt.
 */

export function PlanCard({ plan }: { plan: PublicPlan }) {
  return (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-md bg-surface-container-lowest p-md transition-all duration-200',
        plan.isFeatured
          ? 'border-2 border-primary-container shadow-defined-lift lg:-translate-y-2'
          : 'shadow-soft-lift hover:-translate-y-1 hover:shadow-defined-lift hover:ring-1 hover:ring-primary-container/30',
      )}
    >
      {plan.isFeatured && (
        <>
          {/* A gradient cap rather than a plain border, so the featured plan
              reads as the recommended one from across the room. */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary to-primary-container"
          />
          <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 rounded-b-md bg-primary-container px-4 py-1 text-label-sm font-bold uppercase tracking-wide text-on-primary">
            Most Popular
          </span>
        </>
      )}

      <h3
        className={cn(
          'text-headline-md',
          plan.isFeatured ? 'mt-stack-md text-primary-container' : 'text-on-surface',
        )}
      >
        {plan.name}
      </h3>

      <p className="mt-stack-sm flex items-baseline gap-1">
        <span className="text-headline-lg font-bold text-on-surface">
          {CURRENCY_SYMBOL}
          {formatPrice(plan.price)}
        </span>
        <span className="text-label-md text-on-surface-variant">
          {pricingSuffix(plan.durationValue, plan.durationUnit)}
        </span>
      </p>

      {plan.description && (
        <p className="mt-stack-md text-body-md text-on-surface-variant">{plan.description}</p>
      )}

      {plan.services.length > 0 && (
        <ul className="mt-stack-md flex flex-col gap-stack-sm border-t border-outline-variant/40 pt-stack-md">
          {plan.services.map((service) => (
            <li key={service} className="flex items-center gap-stack-sm">
              <Check className="h-4 w-4 shrink-0 text-primary-container" />
              <span className="text-body-md text-on-surface">{service}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function OfferCard({ offer }: { offer: PublicOffer }) {
  return (
    // The orange rule down the left edge is what stops three white offer cards
    // on a white band reading as one undifferentiated block.
    <SiteCard className="flex h-full flex-col border-l-4 border-primary-container p-md">
      {offer.valueLabel && (
        <span className="w-fit rounded-full bg-primary-container px-3 py-1 text-label-bold uppercase text-on-primary">
          {offer.valueLabel}
        </span>
      )}
      <h3 className="mt-stack-md text-headline-md text-on-surface">{offer.title}</h3>
      {offer.description && (
        <p className="mt-stack-sm text-body-md text-on-surface-variant">{offer.description}</p>
      )}
    </SiteCard>
  )
}

export function TransformationCard({ item }: { item: PublicTransformation }) {
  return (
    <SiteCard className="flex h-full flex-col overflow-hidden">
      {/* Before and after share one row so the comparison reads at a glance.
          The badge sits on the pair, not on either half. */}
      <div className="relative grid grid-cols-2">
        <img
          src={assetUrl(item.beforeImageUrl) ?? undefined}
          alt={`${item.displayName} before`}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover"
        />
        <img
          src={assetUrl(item.afterImageUrl) ?? undefined}
          alt={`${item.displayName} after`}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover"
        />

        {/* An orange seam down the middle. Without it the two photographs blur
            into one image and the comparison stops reading. */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-primary-container"
        />

        <span className="absolute left-0 top-0 bg-primary-container px-3 py-1 text-label-sm font-bold uppercase tracking-wide text-on-primary">
          Before
        </span>
        <span className="absolute right-0 top-0 bg-inverse-surface px-3 py-1 text-label-sm font-bold uppercase tracking-wide text-inverse-on-surface">
          After
        </span>
      </div>

      <div className="flex flex-1 flex-col p-md">
        <div className="flex items-start justify-between gap-stack-sm">
          <h3 className="text-headline-md text-on-surface">{item.displayName}</h3>
          {item.durationLabel && (
            <span className="flex shrink-0 items-center gap-1 text-label-md text-primary-container">
              <Timer className="h-4 w-4" />
              {item.durationLabel}
            </span>
          )}
        </div>

        {item.goal && (
          <p className="mt-1 text-label-md text-on-surface-variant">Goal: {item.goal}</p>
        )}

        {item.description && (
          <p className="mt-stack-md text-body-md text-on-surface-variant">{item.description}</p>
        )}

        {item.achievement && (
          <p className="mt-auto flex items-center gap-stack-sm rounded bg-surface-container-low px-4 py-3 pt-3 text-body-md text-on-surface">
            <Trophy className="h-4 w-4 shrink-0 text-primary-container" />
            {item.achievement}
          </p>
        )}
      </div>
    </SiteCard>
  )
}

export function EventCard({ event }: { event: PublicEvent }) {
  const { day, month } = eventDayParts(event.eventDate)
  const time = eventTimeLabel(event.startTime, event.endTime)
  const image = assetUrl(event.imageUrl)

  return (
    <SiteCard className="flex h-full flex-col overflow-hidden">
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="aspect-[16/9] w-full bg-surface-container" />
        )}

        {/* The date chip is built from the ISO string, never from
            `new Date(...)` — see eventDayParts for why. */}
        <span className="absolute left-4 top-4 flex flex-col items-center rounded-md bg-primary-container px-3 py-2 shadow-defined-lift">
          <span className="text-body-lg font-bold leading-none text-on-primary">{day}</span>
          <span className="text-label-sm uppercase text-on-primary/80">{month}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-md">
        <h3 className="text-headline-md text-on-surface">{event.title}</h3>

        <dl className="mt-stack-md flex flex-col gap-stack-sm">
          {time && (
            <div className="flex items-center gap-stack-sm text-body-md text-on-surface-variant">
              <Clock className="h-4 w-4 shrink-0" />
              <dd>{time}</dd>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-stack-sm text-body-md text-on-surface-variant">
              <MapPin className="h-4 w-4 shrink-0" />
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>

        {event.description && (
          <p className="mt-stack-md text-body-md text-on-surface-variant">{event.description}</p>
        )}
      </div>
    </SiteCard>
  )
}
