import { cn } from '@/utils/cn'

/** Pill toggle used for the Active/Inactive status control on the staff form. */
export function ToggleSwitch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  id: string
}) {
  return (
    <div className="flex items-center gap-sm">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
          checked ? 'bg-primary-container' : 'bg-surface-container-highest',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-4 w-4 rounded-full bg-surface-container-lowest transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
      <span
        className={cn(
          'font-mono text-label-md font-medium',
          checked ? 'text-primary-container' : 'text-on-surface-variant',
        )}
      >
        {label}
      </span>
    </div>
  )
}
