import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-md border bg-surface-container-lowest text-body-md text-on-surface',
          'outline-none transition-all duration-200',
          'placeholder:text-on-secondary-container',
          'focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container',
          error
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-secondary-container',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
