import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Destructive action, visually quarantined. Same treatment on every staff form. */
export function DangerZone({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
}) {
  return (
    <section className="rounded-md border border-error/30 bg-surface-container-lowest p-md">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <h3 className="mb-1 text-headline-md text-error">{title}</h3>
          <p className="text-body-md text-on-surface-variant">{description}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClick}
          className="border-error text-error hover:bg-error/10"
        >
          <Trash2 className="mr-1 h-4 w-4" aria-hidden /> {buttonLabel}
        </Button>
      </div>
    </section>
  )
}
