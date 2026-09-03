import type { ReactNode } from 'react'
import { FormField } from '@/components/ui/form-field'
import { CURRENCY_SYMBOL } from '@/utils/currency'
import { cn } from '@/utils/cn'

/**
 * A money field with the currency symbol as its own element, per the design.
 *
 * The symbol comes from utils/currency, never typed here — a literal ₹ in a
 * screen is the same class of bug as a literal hex colour, and it is how the
 * app ends up billing in two currencies at once.
 */
export function MoneyField({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <FormField label={label} htmlFor={htmlFor} error={error} className={className}>
      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-label-md text-on-surface-variant"
          aria-hidden
        >
          {CURRENCY_SYMBOL}
        </span>
        {children}
      </div>
    </FormField>
  )
}

/** Shared classes for the inputs inside a MoneyField. */
export const moneyInput = 'pl-9'
export const moneyReadOnly = cn(
  moneyInput,
  'cursor-not-allowed border-transparent bg-surface-container text-on-surface-variant',
)
