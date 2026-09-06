/**
 * Date formatting and calendar arithmetic, in one place.
 *
 * There is no date library in this project, and adding one for a month grid and
 * four formatters would be a large dependency for a small job. What is here is
 * the whole of it.
 *
 * Everything works on plain `YYYY-MM-DD` strings, which is what the API sends
 * for a `DateOnly`. Two rules make that safe:
 *
 *  - Parse with an explicit `T00:00:00`. `new Date('2026-08-24')` is parsed as
 *    UTC midnight and then rendered in local time, so west of Greenwich it
 *    prints the 23rd. Appending a time forces local-midnight parsing.
 *  - Never build a key with `toISOString()`, which converts to UTC first and
 *    reintroduces exactly that bug. `toKey` reads the local parts instead.
 */

/** Parses `YYYY-MM-DD` as local midnight. Invalid input gives an invalid Date. */
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

/** A `Date` back to `YYYY-MM-DD`, using local parts — never `toISOString()`. */
export function toKey(date: Date): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** Today as `YYYY-MM-DD` in the viewer's own timezone. */
export function todayKey(): string {
  return toKey(new Date())
}

/** "12 Mar 2026" — the format every list and detail screen writes dates in. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = parseDate(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "Monday" — the second line under a date in the attendance log. */
export function formatWeekday(value: string): string {
  const d = parseDate(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { weekday: 'long' })
}

/** "August 2026" — the month navigator's label. */
export function formatMonth(value: string): string {
  const d = parseDate(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

/** "Today, 24 Aug" for the current day, otherwise the plain date. */
export function formatDayLabel(value: string): string {
  if (value === todayKey()) {
    const d = parseDate(value)
    return `Today, ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
  }
  return formatDate(value)
}

/** A `timestamptz` from the API as "08:42 AM". Null renders as an em dash. */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  // en-IN renders the meridiem lowercase ("08:42 am"); the designs write it
  // uppercase, and it sits next to formatClock's output which already is.
  return d
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase()
}

/**
 * A `timestamptz` from the API as "12 Mar 2026".
 *
 * Separate from formatDate because that one is date-only *by contract*:
 * parseDate appends a literal `T00:00:00`, so handing it an instant builds a
 * string with two time components, gets an Invalid Date, and renders an em dash.
 * Same split as formatTime above, for the same reason — the API sends both
 * `DateOnly` and `timestamptz`, and the two do not parse alike.
 *
 * Rendered in the viewer's timezone, like formatTime. The gym is one branch in
 * one zone, so that is the branch's date; a second branch abroad would need the
 * branch zone threaded through here.
 */
export function formatInstantDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** A `HH:mm:ss` shift time as "06:00 AM". */
export function formatClock(value: string | null | undefined): string {
  if (!value) return '—'
  const [h, m] = value.split(':')
  const hour = Number(h)
  if (Number.isNaN(hour)) return '—'
  const suffix = hour < 12 ? 'AM' : 'PM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${`${display}`.padStart(2, '0')}:${m} ${suffix}`
}

/** "06:00 AM - 02:00 PM", or an em dash when the shift has no fixed hours (Flex). */
export function formatShiftWindow(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start && !end) return '—'
  return `${formatClock(start)} - ${formatClock(end)}`
}

/** Shifts the day by `delta`, returning a `YYYY-MM-DD` key. */
export function addDays(value: string, delta: number): string {
  const d = parseDate(value)
  d.setDate(d.getDate() + delta)
  return toKey(d)
}

/** Shifts the month by `delta`, always landing on the first of that month. */
export function addMonths(value: string, delta: number): string {
  const d = parseDate(value)
  return toKey(new Date(d.getFullYear(), d.getMonth() + delta, 1))
}

/** The first of the month a date falls in. */
export function startOfMonth(value: string): string {
  const d = parseDate(value)
  return toKey(new Date(d.getFullYear(), d.getMonth(), 1))
}

/**
 * How many blank cells precede the 1st in a Monday-first grid.
 *
 * Monday-first, not Sunday-first, because the roster's `workingDays` is ISO
 * (1 = Mon … 7 = Sun) and the M T W T F S S header in the designs matches it.
 * `getDay()` is Sunday-first, hence the shift.
 */
export function leadingBlanks(monthStart: string): number {
  return (parseDate(monthStart).getDay() + 6) % 7
}

/**
 * "10 mins ago" — how the activity feed stamps an entry.
 *
 * Takes a `timestamptz` from the API, not a date key, because the feed is
 * ordered on an instant. Anything older than a week falls back to
 * {@link formatDate}: "23 days ago" is arithmetic the reader has to undo, while
 * "03 Aug 2026" is the answer they wanted.
 *
 * Intl.RelativeTimeFormat rather than a hand-rolled ladder — it handles the
 * singular/plural of every unit for free, which is where these helpers usually
 * go wrong ("1 minutes ago").
 */
const relativeFormatter = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' })

const RELATIVE_STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 60],
  ['minute', 60],
  ['hour', 24],
  ['day', 7],
]

export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—'
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return '—'

  let delta = (then.getTime() - Date.now()) / 1000
  for (const [unit, span] of RELATIVE_STEPS) {
    if (Math.abs(delta) < span) return relativeFormatter.format(Math.round(delta), unit)
    delta /= span
  }

  // Past a week the instant stops being the useful part of the answer.
  return formatDate(toKey(then))
}
