import type { ComponentType } from 'react'
import {
  Archive, BadgeCheck, CalendarCheck, CreditCard, FileText, Pencil, Trash2, UserPlus, Users,
} from 'lucide-react'
import { formatRelative } from '@/utils/date'
import type { ActivityItem } from '@/features/dashboard/types/dashboard'

/**
 * `activity_log.action` is free text — no CHECK constraint — and every module
 * adds verbs as it grows. So this maps the ones written today and falls back to
 * a humanised form of anything else ("pt.assigned" → "Pt assigned") rather than
 * rendering a blank heading the day a new module ships.
 */
const TITLES: Record<string, string> = {
  'member.created': 'New Member Added',
  'member.updated': 'Member Updated',
  'member.status_changed': 'Member Status Changed',
  'member.erased': 'Member Data Erased',
  'membership.renewed': 'Membership Renewed',
  'membership.updated': 'Membership Updated',
  'payment.recorded': 'Payment Recorded',
  'staff.created': 'Staff Added',
  'staff.updated': 'Staff Updated',
  'staff.deleted': 'Staff Removed',
  'staff.erased': 'Staff Data Erased',
  'plan.created': 'Plan Created',
  'plan.updated': 'Plan Updated',
  'plan.archived': 'Plan Archived',
  'attendance.marked': 'Attendance Marked',
  'attendance.corrected': 'Attendance Corrected',
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  member: UserPlus,
  membership: BadgeCheck,
  payment: CreditCard,
  staff: Users,
  plan: FileText,
  attendance: CalendarCheck,
}

/** Verb-shaped tints, so a removal does not look like a signup at a glance. */
function toneFor(action: string): string {
  if (action.endsWith('.erased') || action.endsWith('.deleted')) return 'bg-error/10 text-error'
  if (action.endsWith('.archived')) return 'bg-on-surface-variant/10 text-on-surface-variant'
  if (action.endsWith('.created') || action.endsWith('.renewed') || action.endsWith('.recorded'))
    return 'bg-status-active/10 text-status-active'
  return 'bg-primary-container/10 text-primary-container'
}

function iconFor(item: ActivityItem): ComponentType<{ className?: string }> {
  if (item.action.endsWith('.erased') || item.action.endsWith('.deleted')) return Trash2
  if (item.action.endsWith('.archived')) return Archive
  if (item.action.endsWith('.updated') || item.action.endsWith('.corrected')) return Pencil
  return ICONS[item.entityType] ?? FileText
}

function titleFor(action: string): string {
  if (TITLES[action]) return TITLES[action]
  const words = action.replace(/[._]/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * The accountability trail, read back for the first time.
 *
 * A single-sided timeline at every width rather than the mock's alternating
 * one: descriptions here are full sentences written by the module that logged
 * them ("Sarah Jenkins joined Basic Monthly plan."), and alternating sides
 * halves the width each of them gets while making the reading order ambiguous.
 * The spine, the nodes and the cards are the design's; only the zig-zag is not.
 */
export function RecentActivityCard({ rows }: { rows: ActivityItem[] }) {
  return (
    <section className="card-surface border border-surface-container-high/50 p-md">
      <h2 className="mb-md text-headline-md text-on-surface">Recent Activity</h2>

      {rows.length === 0 ? (
        <p className="py-md text-body-md text-on-surface-variant">Nothing has happened yet.</p>
      ) : (
        <ol className="relative flex flex-col gap-md before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-surface-container-high">
          {rows.map((item) => {
            const Icon = iconFor(item)

            return (
              <li key={item.id} className="relative flex items-start gap-md">
                <span
                  className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-surface-container-lowest ${toneFor(item.action)}`}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1 rounded-md border border-surface-container-high bg-surface-bright p-sm">
                  <div className="mb-1 flex flex-wrap items-start justify-between gap-xs">
                    <h3 className="font-mono text-label-md text-on-surface">{titleFor(item.action)}</h3>
                    <time
                      dateTime={item.createdAt}
                      className="font-mono text-label-sm text-on-surface-variant"
                    >
                      {formatRelative(item.createdAt)}
                    </time>
                  </div>

                  <p className="text-body-md text-on-surface-variant">{item.description}</p>

                  {item.actorEmail && (
                    <p className="mt-1 font-mono text-label-sm text-on-surface-variant/70">
                      by {item.actorEmail}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
