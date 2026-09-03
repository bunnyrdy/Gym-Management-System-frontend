import { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { CameraCapture } from '@/components/ui/camera-capture'
import { cn } from '@/utils/cn'
import { ImageProcessingError, MAX_DIMENSION, prepareImage } from '@/utils/image'
import { assetUrl } from '@/services/api'

/** Only the file input's filter. The real gate is whether the browser decodes it. */
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Photo chooser with a local preview. Two ways in — a file from the device, or a
 * frame from the webcam — and both land in the same `pick()`, which runs
 * `prepareImage` on either. That is the whole point: the backend receives one
 * standardised JPEG regardless of which button was pressed.
 *
 * The preview shows the *processed* blob, so what you see is what uploads.
 *
 * The checks here are courtesy only — they save a round trip and give an
 * instant message. The API re-validates by sniffing magic bytes, because a
 * browser-side check protects nobody from a caller who isn't using the browser.
 *
 * `shape` exists because the two screens frame this differently: staff show a
 * round avatar, the member form shows the design's square drop-well. It also
 * decides the width: only the square variant fills its column. The circle sits
 * in a flex row next to the field grid, and stretching it there squeezes the
 * fields — which is exactly what a stray `w-full` here did once already.
 */
export function PhotoPicker({
  name,
  currentUrl,
  onChange,
  shape = 'circle',
}: {
  name: string
  currentUrl: string | null
  onChange: (file: File | null, removed: boolean) => void
  shape?: 'circle' | 'square'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Object URLs are a memory leak if never revoked.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setProcessing(true)

    try {
      const prepared = await prepareImage(file)

      setPreview((old) => {
        if (old) URL.revokeObjectURL(old)
        return URL.createObjectURL(prepared)
      })
      setRemoved(false)
      onChange(prepared, false)
    } catch (e) {
      setError(
        e instanceof ImageProcessingError ? e.message : 'Could not process that image.',
      )
    } finally {
      setProcessing(false)
      // Let the same file be chosen again after an error.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setRemoved(true)
    setError(null)
    onChange(null, true)
    if (inputRef.current) inputRef.current.value = ''
  }

  const shown = preview ?? (removed ? null : currentUrl)
  const square = shape === 'square'
  const openFilePicker = () => inputRef.current?.click()

  return (
    <div className={cn('flex flex-col items-center gap-sm', square && 'w-full')}>
      {square ? (
        <button
          type="button"
          onClick={openFilePicker}
          disabled={processing}
          className="group relative aspect-square w-full max-w-[260px] overflow-hidden rounded-md border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-primary-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2"
          aria-label="Upload member photo"
        >
          {shown ? (
            <img src={assetUrl(shown) ?? undefined} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-sm text-on-surface-variant transition-colors group-hover:text-primary-container">
              <ImagePlus className="h-10 w-10" aria-hidden />
              <span className="font-mono text-label-md">Upload Member Photo</span>
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          disabled={processing}
          className="group relative h-32 w-32 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2"
          aria-label="Change photo"
        >
          <Avatar name={name || '?'} src={shown} className="h-32 w-32 text-headline-lg" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-inverse-surface/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-inverse-on-surface" />
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={ACCEPTED.join(',')}
        onChange={(e) => void pick(e.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center justify-center gap-sm">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={processing}
          className="font-mono text-label-sm font-bold text-primary-container hover:underline disabled:opacity-50"
        >
          {square ? 'Choose File' : 'Change Photo'}
        </button>
        <button
          type="button"
          onClick={() => setCapturing(true)}
          disabled={processing}
          className="flex items-center gap-1 font-mono text-label-sm font-bold text-primary-container hover:underline disabled:opacity-50"
        >
          <Camera className="h-3 w-3" aria-hidden /> Take Photo
        </button>
        {shown && !processing && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 font-mono text-label-sm text-on-surface-variant hover:text-error"
          >
            <Trash2 className="h-3 w-3" aria-hidden /> Remove
          </button>
        )}
      </div>

      {processing && (
        <p className="text-label-sm text-on-surface-variant" role="status">
          Processing photo…
        </p>
      )}

      {square && !error && !processing && (
        <p className="text-center text-label-sm text-on-surface-variant">
          Any JPG, PNG or WebP — resized to {MAX_DIMENSION}px automatically
        </p>
      )}

      {error && <p className="text-center text-label-sm text-error" role="alert">{error}</p>}

      <CameraCapture
        open={capturing}
        onCapture={(file) => void pick(file)}
        onClose={() => setCapturing(false)}
      />
    </div>
  )
}
