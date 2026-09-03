import { api } from '@/services/api'
import type { PagedResult } from '@/types/api'
import type {
  PublicSite,
  PublicMediaItem,
  PublicTransformation,
  PublicEvent,
  SiteSettings,
  SiteMediaItem,
  SiteOffer,
  SiteTransformation,
  SiteEvent,
  ReorderKind,
} from '@/features/site/types/site'
import type {
  SettingsFormValues,
  OfferFormValues,
  TransformationFormValues,
  EventFormValues,
  MediaFormValues,
} from '@/features/site/schemas/site.schemas'

/**
 * Two services against one module, split the way the API is.
 *
 * `publicSiteService` hits `/public/*`, which needs no token — the request
 * interceptor adds no Authorization header when the store is empty, and
 * `/public` is on the NO_REFRESH_PATHS list in api.ts so a 401 here can never
 * bounce a visitor to the login form.
 */
export const publicSiteService = {
  /** The whole site in one call. */
  get: () => api.get<PublicSite>('/public'),

  gallery: (page = 1, pageSize = 24) =>
    api.get<PagedResult<PublicMediaItem>>('/public/gallery', { params: { page, pageSize } }),

  transformations: (page = 1, pageSize = 12) =>
    api.get<PagedResult<PublicTransformation>>('/public/transformations', {
      params: { page, pageSize },
    }),

  events: (page = 1, pageSize = 12) =>
    api.get<PagedResult<PublicEvent>>('/public/events', { params: { page, pageSize } }),
}

export interface SiteContentFilters {
  section?: string
  status?: string
  page?: number
  pageSize?: number
}

const clean = (v: string | undefined | null) => {
  const trimmed = v?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Multipart, with PascalCase keys to match the server DTO — the same shape
 * `member.service.ts` uses. `undefined` and empty strings are skipped so a
 * blank optional field arrives as absent rather than as "".
 */
function form(fields: Record<string, unknown>, files: Record<string, File | undefined> = {}) {
  const fd = new FormData()

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue
    fd.append(key, typeof value === 'boolean' ? String(value) : String(value))
  }
  for (const [key, file] of Object.entries(files)) {
    if (file) fd.append(key, file)
  }
  return fd
}

export const siteService = {
  // -- settings ------------------------------------------------------------
  settings: () => api.get<SiteSettings>('/site/settings'),

  updateSettings: (values: SettingsFormValues) =>
    api.put<SiteSettings>('/site/settings', {
      heroHeadline: clean(values.heroHeadline),
      heroSubtext: clean(values.heroSubtext),
      foundedYear: values.foundedYear === '' || values.foundedYear === undefined
        ? undefined
        : Number(values.foundedYear),
      memberCountOverride:
        values.memberCountOverride === '' || values.memberCountOverride === undefined
          ? undefined
          : Number(values.memberCountOverride),
      aboutTitle: clean(values.aboutTitle),
      aboutDescription: clean(values.aboutDescription),
      instagramUrl: clean(values.instagramUrl),
      whatsappNumber: clean(values.whatsappNumber),
      mapsUrl: clean(values.mapsUrl),
      footerText: clean(values.footerText),
    }),

  /**
   * Artwork is uploaded, never named — there is no URL field on the settings
   * DTO, so this is the only way to change the hero, the logo or the login
   * image. `slot` is matched against a closed set on the server.
   */
  setArtwork: (slot: 'hero' | 'logo' | 'login', file: File | null) =>
    api.post<SiteSettings>(
      `/site/settings/artwork/${slot}`,
      form({ remove: file ? undefined : true }, { file: file ?? undefined }),
    ),

  setHeroVideo: (file: File | null) =>
    api.post<SiteSettings>(
      '/site/settings/artwork/hero-video',
      form({ remove: file ? undefined : true }, { file: file ?? undefined }),
    ),

  // -- media ---------------------------------------------------------------
  media: (filters: SiteContentFilters = {}) =>
    api.get<PagedResult<SiteMediaItem>>('/site/media', { params: filters }),

  addMedia: (values: MediaFormValues, file: File, poster?: File) =>
    api.post<SiteMediaItem>('/site/media', form({
      Section: values.section,
      Caption: clean(values.caption),
      DisplayOrder: values.displayOrder ?? 0,
      IsActive: values.isActive ?? true,
    }, { file, poster })),

  updateMedia: (id: number, values: MediaFormValues) =>
    api.put<SiteMediaItem>(`/site/media/${id}`, {
      section: values.section,
      caption: clean(values.caption),
      displayOrder: values.displayOrder ?? 0,
      isActive: values.isActive ?? true,
    }),

  deleteMedia: (id: number) => api.delete(`/site/media/${id}`),

  // -- offers --------------------------------------------------------------
  offers: (filters: SiteContentFilters = {}) =>
    api.get<PagedResult<SiteOffer>>('/site/offers', { params: filters }),

  saveOffer: (id: number | undefined, values: OfferFormValues) => {
    const payload = {
      title: values.title.trim(),
      valueLabel: clean(values.valueLabel),
      description: clean(values.description),
      displayOrder: values.displayOrder ?? 0,
      isActive: values.isActive ?? true,
    }
    return id
      ? api.put<SiteOffer>(`/site/offers/${id}`, payload)
      : api.post<SiteOffer>('/site/offers', payload)
  },

  deleteOffer: (id: number) => api.delete(`/site/offers/${id}`),

  // -- transformations -----------------------------------------------------
  transformations: (filters: SiteContentFilters = {}) =>
    api.get<PagedResult<SiteTransformation>>('/site/transformations', { params: filters }),

  saveTransformation: (
    id: number | undefined,
    values: TransformationFormValues,
    before?: File,
    after?: File,
  ) => {
    const body = form({
      MemberId: values.memberId === '' || values.memberId === undefined
        ? undefined
        : Number(values.memberId),
      DisplayName: values.displayName.trim(),
      Goal: clean(values.goal),
      Achievement: clean(values.achievement),
      DurationLabel: clean(values.durationLabel),
      Description: clean(values.description),
      ConsentGiven: values.consentGiven ?? false,
      IsActive: values.isActive ?? false,
      DisplayOrder: values.displayOrder ?? 0,
    }, { before, after })

    return id
      ? api.put<SiteTransformation>(`/site/transformations/${id}`, body)
      : api.post<SiteTransformation>('/site/transformations', body)
  },

  deleteTransformation: (id: number) => api.delete(`/site/transformations/${id}`),

  // -- events --------------------------------------------------------------
  events: (filters: SiteContentFilters = {}) =>
    api.get<PagedResult<SiteEvent>>('/site/events', { params: filters }),

  saveEvent: (id: number | undefined, values: EventFormValues, image?: File) => {
    const body = form({
      Title: values.title.trim(),
      EventDate: values.eventDate,
      StartTime: clean(values.startTime),
      EndTime: clean(values.endTime),
      Location: clean(values.location),
      Description: clean(values.description),
      IsActive: values.isActive ?? true,
      DisplayOrder: values.displayOrder ?? 0,
    }, { image })

    return id
      ? api.put<SiteEvent>(`/site/events/${id}`, body)
      : api.post<SiteEvent>('/site/events', body)
  },

  deleteEvent: (id: number) => api.delete(`/site/events/${id}`),

  /**
   * The whole ordered run, not a swap — idempotent, and two editors reordering
   * at once end with one of their orders rather than an interleaved third.
   */
  reorder: (kind: ReorderKind, orderedIds: number[]) =>
    api.patch(`/site/${kind}/reorder`, { orderedIds }),
}
