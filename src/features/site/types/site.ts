/**
 * The public website and the CMS behind it.
 *
 * Two families of type live here and they are deliberately not shared:
 *
 *   * `Public*` mirror what an anonymous visitor receives. They carry no ids
 *     that link back to a member, no consent timestamps, no visibility flags.
 *   * `Site*` mirror the CMS payloads, which carry all of that.
 *
 * The server draws the same line (see the Public* records in SiteContracts.cs).
 * Collapsing the two here would mean the marketing page compiles against fields
 * it will never receive, and a component written for the CMS would render
 * silently-undefined values on the public page.
 */

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export type MediaKind = 'image' | 'video'

export interface PublicMediaItem {
  kind: MediaKind
  url: string
  posterUrl: string | null
  caption: string | null
}

export interface PublicOffer {
  title: string
  valueLabel: string | null
  description: string | null
}

export interface PublicPlan {
  id: number
  name: string
  description: string | null
  durationValue: number
  durationUnit: DurationUnit
  price: number
  isFeatured: boolean
  services: string[]
}

export interface PublicTransformation {
  displayName: string
  goal: string | null
  beforeImageUrl: string
  afterImageUrl: string
  achievement: string | null
  durationLabel: string | null
  description: string | null
}

export interface PublicEvent {
  title: string
  imageUrl: string | null
  /** ISO date, no time part — a wall-clock fact about the branch's calendar. */
  eventDate: string
  startTime: string | null
  endTime: string | null
  location: string | null
  description: string | null
}

export interface PublicHero {
  headline: string
  subtext: string | null
  imageUrl: string | null
  videoUrl: string | null
  activeMembers: number
  yearsOfExperience: number | null
}

export interface PublicContact {
  phone: string | null
  email: string | null
  instagramUrl: string | null
  whatsappNumber: string | null
  mapsUrl: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
}

/** One response, one instant — see PublicSiteResponse on the server. */
export interface PublicSite {
  gymName: string
  tagline: string | null
  logoUrl: string | null
  footerText: string | null
  hero: PublicHero
  aboutTitle: string | null
  aboutDescription: string | null
  aboutMedia: PublicMediaItem[]
  gallery: PublicMediaItem[]
  plans: PublicPlan[]
  offers: PublicOffer[]
  transformations: PublicTransformation[]
  events: PublicEvent[]
  contact: PublicContact
}

// ---------------------------------------------------------------------------
// CMS
// ---------------------------------------------------------------------------

export type SiteSection = 'about' | 'gallery'

export interface SiteIdentity {
  gymName: string
  tagline: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
}

export interface SiteSettings {
  heroHeadline: string | null
  heroSubtext: string | null
  heroImageUrl: string | null
  heroVideoUrl: string | null
  foundedYear: number | null
  memberCountOverride: number | null
  aboutTitle: string | null
  aboutDescription: string | null
  websiteLogoUrl: string | null
  loginImageUrl: string | null
  instagramUrl: string | null
  whatsappNumber: string | null
  mapsUrl: string | null
  footerText: string | null
  /** Read-through from `tenants` / `branches`. Shown, never written here. */
  identity: SiteIdentity
}

export interface SiteMediaItem {
  id: number
  section: SiteSection
  kind: MediaKind
  url: string
  posterUrl: string | null
  caption: string | null
  displayOrder: number
  isActive: boolean
}

export interface SiteOffer {
  id: number
  title: string
  valueLabel: string | null
  description: string | null
  displayOrder: number
  isActive: boolean
}

export interface SiteTransformation {
  id: number
  memberId: number | null
  displayName: string
  goal: string | null
  beforeImageUrl: string
  afterImageUrl: string
  achievement: string | null
  durationLabel: string | null
  description: string | null
  /** Null means no recorded consent, which means it cannot be published. */
  consentGivenAt: string | null
  displayOrder: number
  isActive: boolean
}

export interface SiteEvent {
  id: number
  title: string
  imageUrl: string | null
  eventDate: string
  startTime: string | null
  endTime: string | null
  location: string | null
  description: string | null
  displayOrder: number
  isActive: boolean
}

/** The four content types the reorder endpoint understands. */
export type ReorderKind = 'media' | 'offers' | 'transformations' | 'events'

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export type DurationUnit = 'day' | 'week' | 'month'

/**
 * "/Mo", "/3 Mos", "/Year" — the suffix beside the price on a plan card.
 *
 * Twelve months reads as "/Year" because that is what the design shows and
 * what a buyer says. Anything else stays in the unit it was sold in rather
 * than being normalised, so a 6-month plan does not become "0.5 Year".
 */
export function pricingSuffix(value: number, unit: DurationUnit): string {
  if (unit === 'month' && value === 12) return '/Year'
  if (unit === 'month') return value === 1 ? '/Mo' : `/${value} Mos`
  if (unit === 'week') return value === 1 ? '/Week' : `/${value} Weeks`
  return value === 1 ? '/Day' : `/${value} Days`
}

/**
 * The date chip on an event card: "15" over "OCT".
 *
 * Built from the ISO parts rather than `new Date(...)` on purpose. The value is
 * a plain date, and passing "2026-10-15" through the Date constructor parses it
 * as UTC midnight — which in any timezone behind UTC renders as the 14th.
 */
export function eventDayParts(isoDate: string): { day: string; month: string } {
  const [, month, day] = isoDate.split('-')
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return { day: day ?? '', month: months[Number(month) - 1] ?? '' }
}

/** "6:00 AM - 7:00 AM", or just the start when there is no end. */
export function eventTimeLabel(start: string | null, end: string | null): string | null {
  if (!start) return null
  const clock = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 === 0 ? 12 : h % 12
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
  }
  return end ? `${clock(start)} - ${clock(end)}` : clock(start)
}
