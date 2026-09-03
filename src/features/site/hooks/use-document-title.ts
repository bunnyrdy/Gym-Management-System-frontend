import { useEffect } from 'react'

/**
 * Sets the browser tab title for a public page.
 *
 * ponytail: this is the whole of the SPA's SEO story, and it is worth being
 * honest about the ceiling. A client-rendered page sets its title after the
 * JavaScript runs, which is fine for a browser tab and useless for a social
 * card — WhatsApp and Instagram read the HTML they are served and never execute
 * anything, so a link to this site previews with whatever is in index.html.
 * Google renders JS and will index it, but slower and less reliably than
 * server-rendered HTML.
 *
 * Fixing it properly means pre-rendering the public routes at build time
 * (vite-plugin-ssg or similar) or putting a small meta-tag service in front.
 * Both are real work and neither is needed to launch, so this is the deliberate
 * V1 ceiling rather than an oversight.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    // Restore on unmount so navigating from a public page into the admin app
    // does not leave the marketing title in the tab.
    return () => {
      document.title = previous
    }
  }, [title])
}
