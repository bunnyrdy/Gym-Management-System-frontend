import type { ReactNode } from 'react'
import { BrandMark } from './brand-mark'

/**
 * The right-hand card shared by every auth screen — brand lockup, heading,
 * body. Matches `code 4.html`: max 440px, 12px radius, Level-1 soft lift, and
 * the 4px primary top border.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex w-full items-center justify-center bg-background p-gutter lg:w-1/2 lg:p-xl fade-in-delayed">
      <div className="card-surface w-full max-w-[440px] border-t-4 border-primary-container p-md">
        <BrandMark className="mb-lg" />

        <div className="mb-lg">
          <h1 className="mb-xs text-headline-lg text-on-surface">{title}</h1>
          <p className="text-body-md text-on-surface-variant">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-lg text-center">{footer}</div>}
      </div>
    </div>
  )
}
