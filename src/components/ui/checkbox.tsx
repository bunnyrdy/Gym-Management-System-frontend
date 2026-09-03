import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(
            'w-4 h-4 rounded-sm border-secondary-container text-primary-container focus:ring-primary-container cursor-pointer',
            className,
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="text-body-md text-on-surface-variant select-none cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'
