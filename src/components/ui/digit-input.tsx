import { forwardRef, type InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/input'

/**
 * A phone field that physically cannot hold more than ten digits. Shared by the
 * member and staff forms — both schemas and both write DTOs demand ^\d{10}$.
 *
 * `maxLength` alone is not enough: it is ignored for `type="number"` and does
 * nothing against a paste of "+91 98765 43210". Stripping non-digits and
 * slicing on every change means the eleventh keystroke and a pasted formatted
 * number both end up as ten digits, which is what the schema and the server
 * both demand.
 *
 * `inputMode="numeric"` gets the numeric keypad on a phone without the spinner,
 * scroll-to-change and locale quirks that `type="number"` brings.
 */
export const DigitInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean; length?: number }
>(({ onChange, length = 10, ...props }, ref) => (
  <Input
    ref={ref}
    type="tel"
    inputMode="numeric"
    autoComplete="tel"
    maxLength={length}
    onChange={(e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, length)
      onChange?.(e)
    }}
    {...props}
  />
))
DigitInput.displayName = 'DigitInput'
