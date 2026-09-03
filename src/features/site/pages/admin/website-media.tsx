import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { assetUrl } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Alert } from '@/components/common/alert'
import { prepareImage } from '@/utils/image'
import {
  CmsPage, CmsSection, RowControls, VisibilityChip, movedOrder,
} from '@/features/site/components/cms-shell'
import {
  useSiteMedia, useAddMedia, useDeleteSiteItem, useReorder,
} from '@/features/site/hooks/use-site'
import type { SiteSection } from '@/features/site/types/site'

/**
 * The About collage and the Gallery, on one screen.
 *
 * They are one table on the server (`site_media`, discriminated by `section`)
 * and one screen here for the same reason: identical shape, identical verbs.
 *
 * Images are resized in the browser before upload — `prepareImage` at 1600px
 * rather than the 1024px an avatar gets, because these are full-width gallery
 * tiles and a 1024px source is visibly soft on a laptop. Videos go up
 * untouched: there is no client-side transcode, and the 32 MB server ceiling is
 * what holds the line.
 */
export default function WebsiteMediaPage() {
  const [section, setSection] = useState<SiteSection>('gallery')
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useSiteMedia({ section, pageSize: 100 })
  const add = useAddMedia()
  const remove = useDeleteSiteItem('media')
  const reorder = useReorder('media')

  const items = data?.items ?? []

  async function onFiles(files: FileList) {
    setUploadError(null)

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/')
      try {
        // Videos skip prepareImage entirely — it is a canvas resize and would
        // throw on anything that is not an image.
        const prepared = isVideo ? file : await prepareImage(file, 1600)
        await add.mutateAsync({ values: { section }, file: prepared })
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : 'That file could not be uploaded.',
        )
      }
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = movedOrder(items, index, direction)
    if (next) reorder.mutate(next)
  }

  return (
    <CmsPage
      title="Gallery"
      subtitle="Photos and videos on the home page."
      action={
        <>
          <input
            ref={input}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void onFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={add.isPending}
            onClick={() => input.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden /> Upload
          </Button>
        </>
      }
    >
      <CmsSection
        title={section === 'gallery' ? 'Gallery' : 'About collage'}
        description={
          section === 'gallery'
            ? 'Shown as a grid on the home page. The first twelve appear there; the rest are on the gallery page.'
            : 'The three photographs beside the About text. The first one runs full height.'
        }
      >
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <label htmlFor="section" className="font-mono text-label-md text-on-surface-variant">
            Section
          </label>
          <Select
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value as SiteSection)}
            className="w-48"
          >
            <option value="gallery">Gallery</option>
            <option value="about">About collage</option>
          </Select>
        </div>

        {uploadError && (
          <Alert variant="error" className="mb-md">
            {uploadError}
          </Alert>
        )}

        {isLoading ? (
          <div className="grid place-items-center py-xl">
            <Spinner className="text-primary-container" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-outline-variant px-md py-xl text-center text-body-md text-on-surface-variant">
            Nothing here yet. Upload a photo or a video to get started.
          </p>
        ) : (
          <ul className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="overflow-hidden rounded-md border border-outline-variant"
              >
                <div className="aspect-video w-full bg-surface-container-low">
                  {item.kind === 'video' ? (
                    <video
                      src={assetUrl(item.url) ?? undefined}
                      poster={assetUrl(item.posterUrl) ?? undefined}
                      controls
                      preload="none"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={assetUrl(item.url) ?? undefined}
                      alt={item.caption ?? ''}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-sm px-sm py-2">
                  <div className="min-w-0">
                    <p className="truncate text-body-md text-on-surface">
                      {item.caption ?? `${item.kind === 'video' ? 'Video' : 'Photo'} ${index + 1}`}
                    </p>
                    <VisibilityChip isActive={item.isActive} />
                  </div>

                  <RowControls
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    busy={reorder.isPending || remove.isPending}
                    onUp={() => move(index, -1)}
                    onDown={() => move(index, 1)}
                    onDelete={() => setPendingDelete(item.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CmsSection>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove this file?"
        body="It will be deleted from the server and disappear from the website. This cannot be undone."
        confirmLabel="Remove"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete !== null) remove.mutate(pendingDelete)
          setPendingDelete(null)
        }}
      />
    </CmsPage>
  )
}
