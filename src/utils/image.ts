/**
 * The one place an image is prepared for upload.
 *
 * Both sources — a file from the device and a frame from the webcam — go through
 * `prepareImage`, so the backend receives the same standardised JPEG whichever
 * way the photo arrived: at most 1024px on the long edge, quality ~0.82, no
 * alpha channel, orientation already applied.
 *
 * The website's gallery passes a larger ceiling. 1024px is right for an avatar
 * rendered at 128px and visibly soft as a full-width hero or gallery tile, so
 * `prepareImage` takes an optional longest-edge argument. Everything else about
 * the pipeline — the quality ladder, the 2 MB output cap, the EXIF rotation —
 * is unchanged, so a bigger source simply lands further down the ladder.
 *
 * Doing this client-side is a bandwidth and storage decision, not a security
 * one. `PhotoStorage` still sniffs magic bytes on every upload, because
 * anything holding a token can POST multipart without going near this file.
 */

export const MAX_DIMENSION = 1024

/** The spec's 80–85% band. */
export const JPEG_QUALITY = 0.82

/**
 * Ceiling on what we will even try to decode. Generous, because a 9 MB phone
 * photo is normal input that should be shrunk rather than refused — the old
 * behaviour rejected it outright against the 2 MB output cap.
 */
export const MAX_INPUT_BYTES = 12 * 1024 * 1024

/** PhotoStorage's own limit. Output above this is a bug in the ladder below. */
export const MAX_OUTPUT_BYTES = 2 * 1024 * 1024

/** Tried in order until the encoded blob fits. */
const QUALITY_LADDER = [JPEG_QUALITY, 0.7, 0.6, 0.5]

export class ImageProcessingError extends Error {}

/**
 * Longest edge down to `maxDimension`, preserving aspect ratio.
 * Never upscales — a 300px avatar stays 300px rather than being blown up into
 * a blurry 1024px one.
 */
function targetSize(width: number, height: number, maxDimension: number) {
  const longest = Math.max(width, height)
  if (longest <= maxDimension) return { width, height }

  const scale = maxDimension / longest
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

/**
 * Decode, resize, flatten and re-encode as JPEG.
 *
 * Throws `ImageProcessingError` with a message meant for a user; callers show
 * it next to the picker rather than in a toast.
 */
export async function prepareImage(
  file: File,
  maxDimension: number = MAX_DIMENSION,
): Promise<File> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageProcessingError(
      `That image is too large. Choose one under ${Math.round(MAX_INPUT_BYTES / 1024 / 1024)} MB.`,
    )
  }

  let bitmap: ImageBitmap
  try {
    // `imageOrientation: 'from-image'` applies the EXIF rotation tag while
    // decoding. Without it every portrait photo taken on a phone uploads on its
    // side: the pixels really are landscape, and only the tag says otherwise —
    // a tag that canvas then discards, so this is the only chance to bake it in.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // The usual cause is HEIC: Safari decodes it, Chrome and Firefox do not.
    throw new ImageProcessingError(
      'That image could not be read. Try a JPEG, PNG or WebP file.',
    )
  }

  try {
    const { width, height } = targetSize(bitmap.width, bitmap.height, maxDimension)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new ImageProcessingError('Could not process that image.')

    // JPEG has no alpha channel. Painting white first stops a transparent PNG
    // from being composited onto the canvas default and arriving solid black.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    for (const quality of QUALITY_LADDER) {
      const blob = await encode(canvas, quality)
      if (!blob) throw new ImageProcessingError('Could not process that image.')
      if (blob.size <= MAX_OUTPUT_BYTES) {
        return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      }
    }

    // 1024px of photographic detail at quality 0.5 is far under 2 MB, so
    // reaching here means the input was pathological rather than merely large.
    throw new ImageProcessingError(
      'That image could not be compressed enough. Try a different photo.',
    )
  } finally {
    // A 12 MP bitmap is tens of megabytes; releasing it is not optional.
    bitmap.close()
  }
}
