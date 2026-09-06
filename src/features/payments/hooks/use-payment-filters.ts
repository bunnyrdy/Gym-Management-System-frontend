import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounced } from '@/utils/use-debounced'
import type { PaymentFilters } from '@/features/payments/services/payment.service'
import type { MemberFilters } from '@/features/members/services/member.service'

/**
 * The five views. Three read the payments ledger; two read `/api/members`,
 * because "who still owes" and "whose membership lapsed" are facts
 * MemberService already computes and the dashboard already counts. A second
 * implementation of either would be the drift v_member_overview exists to
 * prevent.
 */
export type PaymentTab = 'this_month' | 'previous' | 'pending' | 'expired' | 'all'

/** Tabs backed by /api/members rather than /api/payments. */
export function isMemberTab(tab: PaymentTab): boolean {
  return tab === 'pending' || tab === 'expired'
}

export interface PaymentFilterState {
  /** Member name, member code, receipt number or phone. */
  search: string
  phone: string
  /** '' = any month. Requires `year`, on both endpoints. */
  month: string
  year: string
  from: string
  to: string
  balanceDueOnly: boolean
  /** '' | owing | partial | paid — the MEMBERSHIP's payment status. */
  status: string
  planId: string
}

const EMPTY: PaymentFilterState = {
  search: '',
  phone: '',
  month: '',
  year: '',
  from: '',
  to: '',
  balanceDueOnly: false,
  status: '',
  planId: '',
}

const TABS: PaymentTab[] = ['this_month', 'previous', 'pending', 'expired', 'all']

/**
 * What each tab means for the Month/Year and Status controls.
 *
 * This is the one place a tab's defaults live, so a sixth tab cannot be added
 * without deciding them.
 *
 *  * This Month prefills the current month and year, so the controls show the
 *    window the tab is already applying. Safe because WindowAsync resolves
 *    Month+Year and `range=this_month` to the identical window.
 *
 *  * Previous and All CLEAR them, and that is not optional: the server resolves
 *    Month+Year ABOVE Range, so a carried-over current month would show this
 *    month's payments under a tab labelled "Previous".
 *
 *  * Pending defaults Status to `owing` — the queue's whole purpose — and
 *    clears the month so it opens on every outstanding debt rather than one
 *    month's.
 */
type TabDefaults = Pick<PaymentFilterState, 'month' | 'year' | 'status'>

function defaultsFor(tab: PaymentTab): TabDefaults {
  if (tab === 'this_month') {
    const now = new Date()
    return { month: String(now.getMonth() + 1), year: String(now.getFullYear()), status: '' }
  }

  if (tab === 'pending') return { month: '', year: '', status: 'owing' }

  return { month: '', year: '', status: '' }
}

/**
 * Tab + filters + page for the payments page.
 *
 * The tab is seeded from `?tab=` once, on mount — the same rule
 * useMemberFilters follows: the URL is an entry point, not a mirror of the
 * filter bar. That is what lets /app/members/pending-payments redirect here
 * with `?tab=pending` and land on the right view, and what keeps typing in the
 * search box from rewriting the address behind the Back button.
 */
export function usePaymentFilters(pageSize = 20) {
  const [params] = useSearchParams()
  const [tab, setTabState] = useState<PaymentTab>(() => {
    const requested = params.get('tab')
    return requested && (TABS as string[]).includes(requested) ? (requested as PaymentTab) : 'this_month'
  })
  // Seeded from the landing tab, so This Month opens with its month and year
  // already showing rather than filling them in a frame later.
  const [filters, setFilters] = useState<PaymentFilterState>(() => {
    const requested = params.get('tab')
    const initial = requested && (TABS as string[]).includes(requested) ? (requested as PaymentTab) : 'this_month'
    return { ...EMPTY, ...defaultsFor(initial) }
  })
  const [page, setPage] = useState(1)
  const search = useDebounced(filters.search, 300)
  const phone = useDebounced(filters.phone, 300)

  const setTab = (next: PaymentTab) => {
    setTabState(next)
    setFilters((prev) => ({ ...prev, ...defaultsFor(next) }))
    setPage(1)
  }

  const update = (patch: Partial<PaymentFilterState>) => {
    // Selecting "Pending" on a ledger tab asks a question the ledger cannot
    // answer: a member who has paid nothing has no payment row at all
    // (`payments` has CHECK amount > 0), and one who paid half is `partial`.
    // Send them to the tab where the question has rows behind it rather than
    // showing an empty table. Handled here so a sixth tab cannot forget it.
    if (patch.status === 'owing' && !isMemberTab(tab)) {
      setTabState('pending')
      setFilters((prev) => ({ ...prev, ...defaultsFor('pending'), ...patch }))
      setPage(1)
      return
    }

    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1) // a filtered result set has different pages
  }

  const reset = () => {
    setFilters({ ...EMPTY, ...defaultsFor(tab) })
    setPage(1)
  }

  /**
   * The ledger query. `range` comes from the tab; Month/Year override it
   * server-side, so picking August while This Month is open shows August — the
   * filter bar wins over the tab, which is the way round a user expects.
   *
   * The member tabs still build this object (hooks cannot be called
   * conditionally), but their query is disabled, so it costs nothing.
   */
  const paymentQuery = useMemo<PaymentFilters>(
    () => ({
      range: isMemberTab(tab) ? 'all' : tab,
      search: search || undefined,
      phone: phone || undefined,
      month: filters.month ? Number(filters.month) : undefined,
      year: filters.year ? Number(filters.year) : undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      balanceDueOnly: filters.balanceDueOnly || undefined,
      paymentStatus: filters.status || undefined,
      planId: filters.planId ? Number(filters.planId) : undefined,
      page,
      pageSize,
    }),
    [tab, search, phone, filters, page, pageSize],
  )

  /**
   * The same window and filters, minus paging. The four cards describe the
   * filtered set, and that set does not change when you turn the page — keying
   * the stats on the page would refetch them on every Next click for an
   * identical answer.
   */
  const statsQuery = useMemo<PaymentFilters>(() => {
    const { page: _page, pageSize: _pageSize, ...rest } = paymentQuery
    return rest
  }, [paymentQuery])

  /**
   * The member-shaped query, for the Pending and Expired tabs.
   *
   * Month and Year here filter the membership's START date, not a payment date
   * — these rows are memberships and have no single transaction behind them.
   * "August 2026" means the debts incurred that month.
   *
   * Two things carried over verbatim from the screens these tabs replace:
   * `sort=balance_desc`, because a work queue is worked largest-debt-first; and
   * `memberStatus=active` on Expired, because the dashboard's Expired card
   * counts membership states over active members only — without it this tab
   * would list names that card did not count.
   *
   * `search` takes the phone box too: /api/members searches name, phone, code
   * and email through one parameter, so whichever box the desk typed in
   * reaches the same place.
   */
  const memberQuery = useMemo<MemberFilters>(
    () => ({
      search: search || phone || undefined,
      planId: filters.planId ? Number(filters.planId) : undefined,
      month: filters.month ? Number(filters.month) : undefined,
      year: filters.year ? Number(filters.year) : undefined,
      ...(tab === 'expired'
        ? {
            status: 'expired',
            memberStatus: 'active',
            paymentStatus: filters.status || undefined,
          }
        : // The queue's floor: without a status it is still every member who
          // owes, never the whole roster.
          { paymentStatus: filters.status || 'owing', sort: 'balance_desc' }),
      page,
      pageSize,
    }),
    [tab, search, phone, filters.planId, filters.month, filters.year, filters.status, page, pageSize],
  )

  const tabDefaults = defaultsFor(tab)

  return {
    tab,
    setTab,
    filters,
    update,
    reset,
    page,
    setPage,
    paymentQuery,
    statsQuery,
    memberQuery,
    // Measured against the TAB's defaults, not against empty. This Month
    // prefills its month and year, and Pending prefills its status, so a
    // Clear button keyed on "any value set" would sit there permanently
    // offering to undo the thing the tab is for.
    isFiltered: Boolean(
      filters.search ||
        filters.phone ||
        filters.from ||
        filters.to ||
        filters.balanceDueOnly ||
        filters.planId ||
        filters.month !== tabDefaults.month ||
        filters.year !== tabDefaults.year ||
        filters.status !== tabDefaults.status,
    ),
  }
}
