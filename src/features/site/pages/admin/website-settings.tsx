import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { assetUrl } from '@/services/api'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Alert } from '@/components/common/alert'
import { CmsPage, CmsSection } from '@/features/site/components/cms-shell'
import {
  useSiteSettings, useSaveSettings, useSetArtwork, useSetHeroVideo,
} from '@/features/site/hooks/use-site'
import {
  settingsSchema, EMPTY_SETTINGS, type SettingsFormValues,
} from '@/features/site/schemas/site.schemas'

/**
 * Website settings: the hero, the About copy, the social links and the footer.
 *
 * What this screen does NOT edit is as important as what it does. The gym's
 * name, tagline, logo, phone, email and address live on `tenants` and
 * `branches` and are shown here read-only, with a note saying where they are
 * edited. Giving them inputs on this form would create a second copy of the
 * gym's own phone number, and the two would disagree within a week.
 */
function ArtworkSlot({
  label,
  hint,
  url,
  onPick,
  onClear,
  busy,
  accept,
  isVideo,
}: {
  label: string
  hint: string
  url: string | null
  onPick: (file: File) => void
  onClear: () => void
  busy: boolean
  accept: string
  isVideo?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const src = assetUrl(url)

  return (
    <div className="flex flex-col gap-sm">
      <div>
        <p className="font-mono text-label-md font-medium text-on-surface">{label}</p>
        <p className="mt-1 text-label-md text-on-surface-variant">{hint}</p>
      </div>

      <div className="grid aspect-video w-full place-items-center overflow-hidden rounded-md border border-dashed border-outline-variant bg-surface-container-low">
        {busy ? (
          <Spinner className="text-primary-container" />
        ) : src ? (
          isVideo ? (
            <video src={src} controls preload="none" className="h-full w-full object-cover" />
          ) : (
            <img src={src} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <span className="text-label-md text-on-surface-variant">Nothing uploaded</span>
        )}
      </div>

      <div className="flex gap-sm">
        <input
          ref={input}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onPick(file)
            // Reset, or picking the same file twice in a row fires nothing.
            e.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {src ? 'Replace' : 'Upload'}
        </Button>
        {src && (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClear}>
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}

export default function WebsiteSettingsPage() {
  const { data, isLoading } = useSiteSettings()
  const save = useSaveSettings()
  const artwork = useSetArtwork()
  const heroVideo = useSetHeroVideo()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: EMPTY_SETTINGS,
  })

  // The record arrives after the first render, so the form is reset onto it
  // rather than being built from it — the same pattern usePlanForm uses.
  useEffect(() => {
    if (!data) return
    form.reset({
      heroHeadline: data.heroHeadline ?? '',
      heroSubtext: data.heroSubtext ?? '',
      foundedYear: data.foundedYear ?? '',
      memberCountOverride: data.memberCountOverride ?? '',
      aboutTitle: data.aboutTitle ?? '',
      aboutDescription: data.aboutDescription ?? '',
      instagramUrl: data.instagramUrl ?? '',
      mapsUrl: data.mapsUrl ?? '',
      whatsappNumber: data.whatsappNumber ?? '',
      footerText: data.footerText ?? '',
    })
  }, [data, form])

  if (isLoading || !data) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  const { errors } = form.formState
  const identity = data.identity
  const address = [identity.addressLine1, identity.city, identity.state].filter(Boolean).join(', ')

  return (
    <CmsPage title="Website" subtitle="What visitors see at the gym's public address.">
      <form
        onSubmit={form.handleSubmit((values) => save.mutate(values))}
        noValidate
        className="flex flex-col gap-lg"
      >
        <CmsSection
          title="Hero"
          description="The first screen a visitor sees. Leave the headline blank to use the gym's name."
        >
          <div className="grid gap-md lg:grid-cols-2">
            <FormField label="Headline" htmlFor="heroHeadline" error={errors.heroHeadline?.message}>
              <Input
                id="heroHeadline"
                placeholder={identity.gymName}
                error={!!errors.heroHeadline}
                {...form.register('heroHeadline')}
              />
            </FormField>

            <FormField label="Subtext" htmlFor="heroSubtext" error={errors.heroSubtext?.message}>
              <Input
                id="heroSubtext"
                placeholder={identity.tagline ?? 'A short line under the headline'}
                error={!!errors.heroSubtext}
                {...form.register('heroSubtext')}
              />
            </FormField>

            <FormField
              label="Year the gym opened"
              htmlFor="foundedYear"
              error={errors.foundedYear?.message}
            >
              <Input
                id="foundedYear"
                inputMode="numeric"
                placeholder="2019"
                error={!!errors.foundedYear}
                {...form.register('foundedYear')}
              />
            </FormField>

            <FormField
              label="Member count shown"
              htmlFor="memberCountOverride"
              error={errors.memberCountOverride?.message}
              labelRight={
                <span className="text-label-sm text-on-surface-variant">optional</span>
              }
            >
              <Input
                id="memberCountOverride"
                inputMode="numeric"
                placeholder="Counted automatically"
                error={!!errors.memberCountOverride}
                {...form.register('memberCountOverride')}
              />
            </FormField>
          </div>

          <Alert variant="info" className="mt-md">
            Leave the member count blank and the site publishes the real number of active
            members, so it can never go stale. Years of experience is worked out from the
            year above.
          </Alert>

          <div className="mt-md grid gap-md md:grid-cols-2">
            <ArtworkSlot
              label="Hero image"
              hint="The background photograph. JPEG, PNG or WebP, up to 2 MB."
              url={data.heroImageUrl}
              accept="image/jpeg,image/png,image/webp"
              busy={artwork.isPending}
              onPick={(file) => artwork.mutate({ slot: 'hero', file })}
              onClear={() => artwork.mutate({ slot: 'hero', file: null })}
            />
            <ArtworkSlot
              label="Hero video"
              hint="Optional walkthrough. MP4 or WebM, up to 32 MB. Never plays on its own."
              url={data.heroVideoUrl}
              accept="video/mp4,video/webm"
              isVideo
              busy={heroVideo.isPending}
              onPick={(file) => heroVideo.mutate(file)}
              onClear={() => heroVideo.mutate(null)}
            />
          </div>
        </CmsSection>

        <CmsSection title="About" description="The section under the hero on the home page.">
          <div className="flex flex-col gap-md">
            <FormField label="Title" htmlFor="aboutTitle" error={errors.aboutTitle?.message}>
              <Input
                id="aboutTitle"
                placeholder="More Than a Gym"
                error={!!errors.aboutTitle}
                {...form.register('aboutTitle')}
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="aboutDescription"
              error={errors.aboutDescription?.message}
            >
              <Textarea
                id="aboutDescription"
                rows={5}
                error={!!errors.aboutDescription}
                {...form.register('aboutDescription')}
              />
            </FormField>
          </div>
        </CmsSection>

        <CmsSection
          title="Contact & social"
          description="Phone, email and address come from the branch record and are shown here for reference."
        >
          <div className="grid gap-md lg:grid-cols-2">
            <FormField label="Instagram URL" htmlFor="instagramUrl" error={errors.instagramUrl?.message}>
              <Input
                id="instagramUrl"
                placeholder="https://instagram.com/yourgym"
                error={!!errors.instagramUrl}
                {...form.register('instagramUrl')}
              />
            </FormField>

            <FormField label="WhatsApp number" htmlFor="whatsappNumber" error={errors.whatsappNumber?.message}>
              <Input
                id="whatsappNumber"
                placeholder="+91 90000 00000"
                error={!!errors.whatsappNumber}
                {...form.register('whatsappNumber')}
              />
            </FormField>

            <FormField label="Google Maps URL" htmlFor="mapsUrl" error={errors.mapsUrl?.message}>
              <Input
                id="mapsUrl"
                placeholder="https://maps.google.com/..."
                error={!!errors.mapsUrl}
                {...form.register('mapsUrl')}
              />
            </FormField>

            <FormField label="Footer text" htmlFor="footerText" error={errors.footerText?.message}>
              <Input
                id="footerText"
                placeholder={`© ${new Date().getFullYear()} ${identity.gymName}. All rights reserved.`}
                error={!!errors.footerText}
                {...form.register('footerText')}
              />
            </FormField>
          </div>

          <dl className="mt-md grid gap-sm rounded-md bg-surface-container-low p-md sm:grid-cols-3">
            {[
              { label: 'Gym name', value: identity.gymName },
              { label: 'Phone', value: identity.phone ?? 'Not set' },
              { label: 'Email', value: identity.email ?? 'Not set' },
              { label: 'Address', value: address || 'Not set' },
            ].map((row) => (
              <div key={row.label}>
                <dt className="font-mono text-label-sm uppercase text-on-surface-variant">
                  {row.label}
                </dt>
                <dd className="mt-0.5 text-body-md text-on-surface">{row.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-sm flex items-start gap-xs text-label-md text-on-surface-variant">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            These are stored once, on the gym and branch records, so the website and the
            desk always show the same details.
          </p>
        </CmsSection>

        <CmsSection
          title="Brand artwork"
          description="Used on the website header and the sign-in screen."
        >
          <div className="grid gap-md md:grid-cols-2">
            <ArtworkSlot
              label="Website logo"
              hint="Shown in the public header. Falls back to the gym logo."
              url={data.websiteLogoUrl}
              accept="image/jpeg,image/png,image/webp"
              busy={artwork.isPending}
              onPick={(file) => artwork.mutate({ slot: 'logo', file })}
              onClear={() => artwork.mutate({ slot: 'logo', file: null })}
            />
            <ArtworkSlot
              label="Sign-in image"
              hint="The photograph beside the login form."
              url={data.loginImageUrl}
              accept="image/jpeg,image/png,image/webp"
              busy={artwork.isPending}
              onPick={(file) => artwork.mutate({ slot: 'login', file })}
              onClear={() => artwork.mutate({ slot: 'login', file: null })}
            />
          </div>
        </CmsSection>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" loading={save.isPending}>
            Save settings
          </Button>
        </div>
      </form>
    </CmsPage>
  )
}
