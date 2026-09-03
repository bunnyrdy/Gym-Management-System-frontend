import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Native <dialog>, so the browser gives us the focus trap, Escape handling and
 * inert background for free rather than us re-implementing all three.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      className="m-auto max-w-[440px] rounded-md bg-surface-container-lowest p-md text-on-surface shadow-defined-lift backdrop:bg-inverse-surface/40"
    >
      <h2 className="mb-xs text-headline-md text-on-surface">{title}</h2>
      <p className="mb-lg text-body-md text-on-surface-variant">{body}</p>

      <div className="flex justify-end gap-sm">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          loading={loading}
          onClick={onConfirm}
          className="bg-error hover:bg-on-error-container"
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
