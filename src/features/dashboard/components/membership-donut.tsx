import type { MembershipMix } from '@/features/dashboard/types/dashboard'

/**
 * The membership mix, as a ring.
 *
 * Hand-drawn SVG rather than a charting library: this is three arcs, and the
 * smallest chart package is larger than the whole feature slice around it.
 *
 * The trick is the radius. 15.9155 gives a circumference of ~100
 * (2πr ≈ 100.00), so a `stroke-dasharray` of "42 100" is literally "42 percent"
 * and no arc-length maths is needed. The circle is rotated -90° so the first
 * slice starts at twelve o'clock, and each slice is offset by the sum of the
 * ones before it.
 *
 * Colours come from theme tokens through `currentColor` — never a literal hex.
 */
const RADIUS = 15.9155
const RING = `M18 2.0845 a ${RADIUS} ${RADIUS} 0 0 1 0 31.831 a ${RADIUS} ${RADIUS} 0 0 1 0 -31.831`

type Slice = { key: keyof Omit<MembershipMix, 'total'>; label: string; color: string; dot: string }

const SLICES: Slice[] = [
  { key: 'active', label: 'Active', color: 'text-status-active', dot: 'bg-status-active' },
  { key: 'expiringSoon', label: 'Expiring', color: 'text-status-pending', dot: 'bg-status-pending' },
  { key: 'expired', label: 'Expired', color: 'text-status-expired', dot: 'bg-status-expired' },
]

export function MembershipDonut({ mix }: { mix: MembershipMix }) {
  const total = mix.total

  // Percentages, and the running offset each slice starts at — a fold rather
  // than a mutable counter, so nothing is reassigned mid-render. Guarding on
  // total === 0 matters: without it every arc is NaN and the ring vanishes
  // rather than rendering the empty state below.
  const arcs = SLICES.reduce<(Slice & { percent: number; offset: number })[]>((acc, slice) => {
    const percent = total > 0 ? (mix[slice.key] / total) * 100 : 0
    const previous = acc[acc.length - 1]
    const offset = previous ? previous.offset + previous.percent : 0
    return [...acc, { ...slice, percent, offset }]
  }, [])

  return (
    <section className="card-surface flex flex-col border border-surface-container-high/50 p-md">
      <h2 className="mb-md text-headline-md text-on-surface">Membership Overview</h2>

      {total === 0 ? (
        <p className="py-xl text-center text-body-md text-on-surface-variant">
          No memberships sold yet.
        </p>
      ) : (
        <>
          <div className="relative mx-auto h-40 w-40">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" role="img"
                 aria-label={`${mix.active} active, ${mix.expiringSoon} expiring soon, ${mix.expired} expired`}>
              {/* The track, so a mix that does not fill the ring still reads as
                  a ring rather than a stray arc. */}
              <path
                d={RING}
                fill="none"
                strokeWidth={4}
                className="text-surface-container-high"
                stroke="currentColor"
              />

              {arcs.map((arc) => (
                <path
                  key={arc.key}
                  d={RING}
                  fill="none"
                  strokeWidth={4}
                  strokeDasharray={`${arc.percent} 100`}
                  strokeDashoffset={-arc.offset}
                  className={arc.color}
                  stroke="currentColor"
                />
              ))}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-headline-md font-bold text-on-surface">{total}</span>
              <span className="font-mono text-label-sm text-on-surface-variant">Total</span>
            </div>
          </div>

          <ul className="mt-md flex flex-wrap justify-center gap-md">
            {arcs.map((arc) => (
              <li key={arc.key} className="flex items-center gap-xs">
                <span className={`h-2 w-2 rounded-full ${arc.dot}`} aria-hidden />
                <span className="font-mono text-label-sm text-on-surface-variant">
                  {arc.label} · {mix[arc.key]}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
