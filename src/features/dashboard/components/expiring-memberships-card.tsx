import { Link } from 'react-router-dom'
import { Eye, RefreshCw } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Chip, type ChipTone } from '@/components/ui/status-chip'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/utils/date'
import type { ExpiringMembershipItem } from '@/features/dashboard/types/dashboard'

const HEADERS = ['Member', 'Plan', 'Expiry Date', 'Days Left', 'Actions']

/**
 * How many days are left, as a chip.
 *
 * `daysRemaining` is `end_date - CURRENT_DATE` from v_member_overview, so it
 * goes negative once a membership has lapsed — those rows are the point of the
 * table, not an error to filter out.
 */
function daysLeft(days: number | null): { tone: ChipTone; label: string } {
  if (days === null) return { tone: 'inactive', label: '—' }
  if (days < 0) return { tone: 'error', label: 'Expired' }
  if (days === 0) return { tone: 'pending', label: 'Today' }
  return { tone: days <= 3 ? 'pending' : 'inactive', label: `${days} day${days === 1 ? '' : 's'}` }
}

/**
 * The work queue: who lapses in the next week, soonest first.
 *
 * Not a `TableCard` — that component owns a pagination footer and a header row
 * built from strings, and this card needs a "View All" control in its own
 * header instead. It borrows the same table styling so the two read as one
 * family.
 */
export function ExpiringMembershipsCard({ rows }: { rows: ExpiringMembershipItem[] }) {
  return (
    <section className="card-surface flex flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-surface-container-high px-md py-sm">
        <h2 className="text-headline-md text-on-surface">Expiring Memberships (7 Days)</h2>
        <Link
          to={`${ROUTES.MEMBERS}?status=expiring_soon`}
          className="font-mono text-label-sm text-primary-container hover:underline"
        >
          View All
        </Link>
      </header>

      {/* The empty state sits outside the table on purpose. Inside it, the row
          spans the table's own min-width — wider than a phone — so the message
          would be half off-screen behind a horizontal scrollbar that exists
          only to reveal the words "in the next 7 days". */}
      {rows.length === 0 ? (
        <p className="px-md py-xl text-center text-body-md text-on-surface-variant">
          Nothing expires in the next 7 days.
        </p>
      ) : (
      /* Ten rows unscrolled runs to roughly 600px, well past the donut and
         attendance cards stacked in the 4-column sidebar beside this one, which
         would leave the dashboard visibly lopsided. Cap the body and scroll it
         instead: about eight rows visible, all ten reachable, and the card lands close
         to the sidebar beside it. Horizontal scroll
         stays for narrow screens — the table has always been wider than a
         phone. */
      <div className="max-h-[34rem] overflow-x-auto overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-container-high">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  /* sticky sits on the CELLS, not the row: position: sticky has
                     no effect on a <tr> in Chrome or Safari. bg-surface-bright
                     moved here from the <tr> for the same reason — a
                     transparent sticky header would have rows scrolling
                     visibly underneath it. */
                  className="sticky top-0 z-10 bg-surface-bright px-md py-sm font-mono text-label-sm font-medium uppercase tracking-wider text-on-surface-variant last:text-right"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container-high">
            {rows.map((row) => {
              const chip = daysLeft(row.daysRemaining)

              return (
                <tr key={row.memberId} className="group transition-colors hover:bg-surface-container-low">
                  <td className="px-md py-sm">
                    <div className="flex items-center gap-sm">
                      <Avatar name={row.fullName} src={row.photoUrl} className="h-10 w-10 text-label-md" />
                      <span className="truncate text-body-md font-semibold text-on-surface">
                        {row.fullName}
                      </span>
                    </div>
                  </td>

                  <td className="px-md py-sm text-body-md text-on-surface-variant">
                    {row.planName ?? '—'}
                  </td>

                  <td className="px-md py-sm font-mono text-label-md text-on-surface">
                    {formatDate(row.endDate)}
                  </td>

                  <td className="px-md py-sm">
                    <Chip tone={chip.tone} label={chip.label} />
                  </td>

                  <td className="px-md py-sm">
                    {/* Visible on hover on a pointer device, per the design, but
                        always present in the DOM and reachable by keyboard —
                        opacity-0 alone would hide the focus ring too, so
                        focus-within brings the group back. */}
                    <div className="flex items-center justify-end gap-sm opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      <Link
                        to={ROUTES.memberDetails(row.memberId)}
                        className="text-on-surface-variant transition-colors hover:text-primary-container"
                        aria-label={`View ${row.fullName}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={ROUTES.memberMembership(row.memberId)}
                        className="flex items-center gap-xs font-mono text-label-sm font-bold text-primary-container hover:underline"
                      >
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Renew
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      )}
    </section>
  )
}
