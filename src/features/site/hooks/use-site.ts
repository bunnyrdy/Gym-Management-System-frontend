import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/auth'
import {
  publicSiteService,
  siteService,
  type SiteContentFilters,
} from '@/features/site/services/site.service'
import type {
  MediaFormValues,
  OfferFormValues,
  TransformationFormValues,
  EventFormValues,
  SettingsFormValues,
} from '@/features/site/schemas/site.schemas'
import type { ReorderKind } from '@/features/site/types/site'

export const keys = {
  all: ['site'] as const,
  public: ['site', 'public'] as const,
  settings: ['site', 'settings'] as const,
  list: (kind: string, f: SiteContentFilters) => ['site', kind, f] as const,
}

function message(err: unknown, fallback: string) {
  return (err as AxiosError<ApiError>)?.response?.data?.message ?? fallback
}

/**
 * Every CMS write drops BOTH the admin lists and the cached public payload.
 *
 * It lives here rather than at each call site for the same reason
 * `invalidateMemberViews` does in use-members.ts: there are nine mutations
 * below, and nine call sites is already too many places for the tenth to be
 * forgotten. Without it, an editor publishes an offer, opens the site in the
 * next tab and sees the old one for five minutes.
 */
function invalidateSite(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: keys.all })
}

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

/**
 * The whole marketing site in one query.
 *
 * `staleTime` is deliberately longer than the app default: this is content a
 * gym edits a few times a month, and a visitor scrolling between pages should
 * not re-fetch it. The CMS invalidates the key on every write, so an editor
 * still sees their own change immediately.
 */
export function usePublicSite() {
  return useQuery({
    queryKey: keys.public,
    queryFn: () => publicSiteService.get().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  })
}

export function usePublicTransformations(page: number) {
  return useQuery({
    queryKey: ['site', 'public', 'transformations', page],
    queryFn: () => publicSiteService.transformations(page).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function usePublicEvents(page: number) {
  return useQuery({
    queryKey: ['site', 'public', 'events', page],
    queryFn: () => publicSiteService.events(page).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function usePublicGallery(page: number) {
  return useQuery({
    queryKey: ['site', 'public', 'gallery', page],
    queryFn: () => publicSiteService.gallery(page).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

// ---------------------------------------------------------------------------
// CMS reads
// ---------------------------------------------------------------------------

export function useSiteSettings() {
  return useQuery({
    queryKey: keys.settings,
    queryFn: () => siteService.settings().then((r) => r.data),
  })
}

export function useSiteMedia(filters: SiteContentFilters) {
  return useQuery({
    queryKey: keys.list('media', filters),
    queryFn: () => siteService.media(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useSiteOffers(filters: SiteContentFilters) {
  return useQuery({
    queryKey: keys.list('offers', filters),
    queryFn: () => siteService.offers(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useSiteTransformations(filters: SiteContentFilters) {
  return useQuery({
    queryKey: keys.list('transformations', filters),
    queryFn: () => siteService.transformations(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useSiteEvents(filters: SiteContentFilters) {
  return useQuery({
    queryKey: keys.list('events', filters),
    queryFn: () => siteService.events(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

// ---------------------------------------------------------------------------
// CMS writes
// ---------------------------------------------------------------------------

export function useSaveSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: SettingsFormValues) =>
      siteService.updateSettings(values).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Website settings saved')
    },
    onError: (err) => toast.error(message(err, 'Could not save the settings')),
  })
}

export function useSetArtwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slot, file }: { slot: 'hero' | 'logo' | 'login'; file: File | null }) =>
      siteService.setArtwork(slot, file).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Artwork updated')
    },
    onError: (err) => toast.error(message(err, 'Could not update the artwork')),
  })
}

export function useSetHeroVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File | null) => siteService.setHeroVideo(file).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Hero video updated')
    },
    onError: (err) => toast.error(message(err, 'Could not update the video')),
  })
}

export function useAddMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ values, file, poster }: {
      values: MediaFormValues
      file: File
      poster?: File
    }) => siteService.addMedia(values, file, poster).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Added to the gallery')
    },
    onError: (err) => toast.error(message(err, 'Could not upload that file')),
  })
}

export function useSaveOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id?: number; values: OfferFormValues }) =>
      siteService.saveOffer(id, values).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Offer saved')
    },
    onError: (err) => toast.error(message(err, 'Could not save the offer')),
  })
}

export function useSaveTransformation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values, before, after }: {
      id?: number
      values: TransformationFormValues
      before?: File
      after?: File
    }) => siteService.saveTransformation(id, values, before, after).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Transformation saved')
    },
    onError: (err) => toast.error(message(err, 'Could not save the transformation')),
  })
}

export function useSaveEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values, image }: {
      id?: number
      values: EventFormValues
      image?: File
    }) => siteService.saveEvent(id, values, image).then((r) => r.data),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Event saved')
    },
    onError: (err) => toast.error(message(err, 'Could not save the event')),
  })
}

/**
 * One delete hook for all four content types. The kind picks the endpoint;
 * everything else — invalidation, the toast, the error path — is identical, and
 * four near-identical hooks is four places for the next one to drift.
 */
export function useDeleteSiteItem(kind: ReorderKind) {
  const queryClient = useQueryClient()

  const remove = {
    media: siteService.deleteMedia,
    offers: siteService.deleteOffer,
    transformations: siteService.deleteTransformation,
    events: siteService.deleteEvent,
  }[kind]

  return useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: () => {
      invalidateSite(queryClient)
      toast.success('Removed')
    },
    onError: (err) => toast.error(message(err, 'Could not remove that item')),
  })
}

export function useReorder(kind: ReorderKind) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds: number[]) => siteService.reorder(kind, orderedIds),
    onSuccess: () => invalidateSite(queryClient),
    onError: (err) => toast.error(message(err, 'Could not save the new order')),
  })
}
