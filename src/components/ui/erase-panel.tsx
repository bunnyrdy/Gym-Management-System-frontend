import { ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * The DPDP erasure control, quarantined next to the Danger Zone but kept
 * separate from it — the two do different things and one is recoverable.
 *
 * Delete hides a row; a DBA can put it back. Erase overwrites the person and
 * nobody can. Presenting them as one button would mean whichever a user reached
 * for, they would sometimes get the other.
 */
export function ErasePanel({
  subject,
  kept,
  loading,
  onErase,
}: {
  /** What is being erased, for the copy: "member", "trainer". */
  subject: string
  /** What deliberately survives, so the reason is on screen rather than in a comment. */
  kept: string
  loading?: boolean
  onErase: () => void
}) {
  return (
    <section className="rounded-md border border-error/40 bg-error/5 p-md">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h3 className="mb-1 flex items-center gap-xs text-headline-md text-error">
            <ShieldOff className="h-4 w-4" aria-hidden /> Erase personal data
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Permanently overwrites this {subject}&rsquo;s name, contact details, date of birth
            and photo. {kept} is kept. Use this when someone asks for their data to be erased.
            It cannot be undone.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={loading}
          onClick={onErase}
          className="border-error text-error hover:bg-error/10"
        >
          Erase personal data
        </Button>
      </div>
    </section>
  )
}
