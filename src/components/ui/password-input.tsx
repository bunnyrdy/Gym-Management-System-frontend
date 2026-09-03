import { type InputHTMLAttributes, forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full px-4 py-3 pr-11 rounded-md border bg-surface-container-lowest text-body-md text-on-surface',
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
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
