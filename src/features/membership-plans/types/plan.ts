import { formatAmount } from '@/utils/currency'

export type DurationUnit = 'day' | 'week' | 'month'

/** One row of the Included Services catalog, served by /lookups/plan-services. */
export interface PlanServiceOption {
  id: number
  name: string
}

export interface MembershipPlan {
  id: number
  name: string
  planCode: string | null
  description: string | null
  durationValue: number
  durationUnit: DurationUnit
  price: number
  isActive: boolean
  displayOrder: number
  createdAt: string
  services: PlanServiceOption[]
}

/** The list table's shape — services collapsed to a count. */
export interface MembershipPlanListItem {
  id: number
  name: string
  planCode: string | null
  durationValue: number
  durationUnit: DurationUnit
  price: number
  isActive: boolean
  displayOrder: number
  serviceCount: number
}

export const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  day: 'Days',
  week: 'Weeks',
  month: 'Months',
}

/** "12 Months", "1 Month" — the design writes the singular when the value is 1. */
export function durationLabel(value: number, unit: DurationUnit): string {
  const plural = DURATION_UNIT_LABELS[unit]
  return `${value} ${value === 1 ? plural.slice(0, -1) : plural}`
}

/**
 * Prices come back as numbers; the design shows two decimals everywhere.
 * Digits only — the screens render the ₹ as its own element so it can be sized
 * separately. Grouping and symbol live in utils/currency.
 */
export function formatPrice(value: number): string {
  return formatAmount(value)
}
