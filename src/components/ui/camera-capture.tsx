import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Live webcam capture in a native <dialog> — focus trap, Escape and inert
 * background come from the element rather than from us.
 *
 * Three things here are not optional:
 *
 *  * Every track is stopped on close, capture and unmount. A MediaStream that
 *    outlives the dialog leaves the camera light on, which reads to the person
 *    in front of it as being recorded.
 *  * getUserMedia only exists in a secure context. localhost and HTTPS work;
 *    plain HTTP to a LAN address does not, and the API is simply absent there
 *    rather than failing on call. That case is reported, not left as a button
 *    that does nothing.
 *  * The captured frame is handed back as a File through the same path a picked
 *    file takes, so `prepareImage` resizes and compresses it identically.
 *
 * This component crops, and nothing else. The square crop is a framing decision
 * that belongs to the camera; the resize and the JPEG quality belong to the
 * shared pipeline, so they are not repeated here. Encoding at full quality
 * keeps this a lossless hand-off — the one re-encode happens downstream.
 */
export function CameraCapture({
  open,
  onCapture,
  onClose,
}: {
  open: boolean
  onCapture: (file: File) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!open) {
      if (dialog.open) dialog.close()
      stop()
      return
    }

    if (!dialog.open) dialog.showModal()
    setError(null)

    let cancelled = false

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('This browser cannot open the camera here. Use HTTPS, or choose a file instead.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        })

        // The dialog may have been closed while permission was pending.
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => undefined)
        }
        setReady(true)
      } catch (e) {
        const name = (e as DOMException)?.name
        if (name === 'NotAllowedError')
          setError('Camera permission was refused. Allow it in the browser, or choose a file instead.')
        else if (name === 'NotFoundError')
          setError('No camera was found. Choose a file instead.')
        else setError('Could not open the camera. Choose a file instead.')
      }
    }

    void start()

    return () => {
      cancelled = true
    }
  }, [open, stop])

  // Belt and braces: a route change that unmounts this must not leave the
  // camera running.
  useEffect(() => stop, [stop])

  const capture = () => {
    const video = videoRef.current
    if (!video || !ready) return

    // Square crop, centred — the design's photo well is 1:1, and cropping here
    // means we never upload pixels that will only be thrown away.
    const side = Math.min(video.videoWidth, video.videoHeight)
    const canvas = document.createElement('canvas')
    canvas.width = side
    canvas.height = side

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      side,
      side,
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCapture(new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' }))
        stop()
        onClose()
      },
      'image/jpeg',
      // Near-lossless: prepareImage does the real compression, and compressing
      // twice would show as artefacts without saving anything.
      0.98,
    )
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault()
        stop()
        onClose()
      }}
      className="m-auto w-[min(92vw,420px)] rounded-md bg-surface-container-lowest p-md text-on-surface shadow-defined-lift backdrop:bg-inverse-surface/40"
    >
      <div className="mb-sm flex items-center justify-between">
        <h2 className="text-headline-md text-on-surface">Take Photo</h2>
        <button
          type="button"
          onClick={() => {
            stop()
            onClose()
          }}
          className="rounded-md p-1 text-on-surface-variant transition-colors hover:text-on-surface"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <p className="mb-md text-body-md text-error" role="alert">
          {error}
        </p>
      ) : (
        <div className="mb-md aspect-square w-full overflow-hidden rounded-md bg-inverse-surface">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex justify-end gap-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            stop()
            onClose()
          }}
        >
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={capture} disabled={!ready || Boolean(error)}>
          <Camera className="h-4 w-4" aria-hidden /> Capture
        </Button>
      </div>
    </dialog>
  )
}
