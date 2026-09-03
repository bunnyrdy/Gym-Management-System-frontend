import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  className?: string
  labelRight?: ReactNode
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
  labelRight,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between items-center">
        <label
          htmlFor={htmlFor}
          className="font-mono text-label-md text-on-surface"
        >
          {label}
        </label>
        {labelRight}
      </div>
      {children}
      {error && (
        <p className="text-label-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
