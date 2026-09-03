import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Spinner } from './spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        // Primary #ff6b00 (primary-container), no shadow, bold type.
        primary:
          'bg-primary-container text-on-primary font-semibold hover:bg-primary rounded-md',
        // Transparent with a 1.5px charcoal border.
        secondary:
          'border-[1.5px] border-on-surface bg-transparent text-on-surface hover:bg-surface-container-low rounded-md',
        // Least-frequent actions: Cancel, Skip.
        ghost:
          'text-on-surface-variant hover:text-primary-container hover:bg-surface-container-low rounded-md',
        link: 'text-primary hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-4 text-[14px] leading-[20px]',
        md: 'h-12 px-6 text-[14px] leading-[20px]',
        lg: 'h-14 px-8 text-[16px] leading-[24px]',
        full: 'w-full h-12 text-[14px] leading-[20px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'full',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" />
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
