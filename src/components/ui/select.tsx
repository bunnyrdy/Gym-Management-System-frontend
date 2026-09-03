import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none px-4 py-3 pr-10 rounded-md border bg-surface-container-lowest text-body-md text-on-surface',
          'outline-none transition-all duration-200',
          'focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container',
          error ? 'border-error focus:border-error' : 'border-secondary-container',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
        aria-hidden
      />
    </div>
  ),
)
Select.displayName = 'Select'
