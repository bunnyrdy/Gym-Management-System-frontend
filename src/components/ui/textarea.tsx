import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-4 py-3 rounded-md border bg-surface-container-lowest text-body-md text-on-surface',
        'outline-none transition-all duration-200 resize-y',
        'placeholder:text-on-secondary-container',
        'focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container',
        error ? 'border-error focus:border-error' : 'border-secondary-container',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
