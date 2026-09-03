import type { MessagingSettings } from '@/features/settings/types/settings'

/**
 * How much of today's allowance is left, split the way the server splits it.
 *
 * The reserve is drawn as its own segment rather than folded into "remaining",
 * because that is the one thing about this system that is not obvious: the last
 * thirty are not available to renewal reminders however quiet the day has been.
 * A single "212 of 270 left" bar would tell the owner the opposite of the truth
 * on the afternoon it matters.
 */
export function QuotaMeter({ data }: { data: MessagingSettings }) {
  const { dailyEmailLimit: limit, highPriorityReserve: reserve } = data
  const spent = data.highSentToday + data.normalSentToday
  const pct = (n: number) => `${Math.min((n / Math.max(limit, 1)) * 100, 100)}%`

  const resetsAt = new Date(data.quotaResetsAtLocal).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <p className="font-mono text-display-sm text-on-surface">
          {data.normalRemainingToday}
          <span className="ml-2 text-body-md text-on-surface-variant">
            reminders left today
          </span>
        </p>
        <p className="text-label-md text-on-surface-variant">
          {spent} of {limit} sent · resets {resetsAt}
        </p>
      </div>

      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container-highest"
        role="img"
        aria-label={`${spent} of ${limit} sent today, ${reserve} held back for password resets`}
      >
        <div className="bg-primary-container" style={{ width: pct(data.normalSentToday) }} />
        <div className="bg-primary" style={{ width: pct(data.highSentToday) }} />
        <div
          className="ml-auto border-l border-surface-container-lowest bg-surface-container"
          style={{ width: pct(reserve) }}
        />
      </div>

      <dl className="flex flex-wrap gap-lg text-label-md">
        <Legend swatch="bg-primary-container" term="Reminders" value={data.normalSentToday} />
        <Legend swatch="bg-primary" term="Resets & notices" value={data.highSentToday} />
        <Legend
          swatch="bg-surface-container"
          term="Held for resets"
          value={reserve}
          hint="Never spent on reminders, however quiet the day."
        />
      </dl>
    </div>
  )
}

function Legend({
  swatch,
  term,
  value,
  hint,
}: {
  swatch: string
  term: string
  value: number
  hint?: string
}) {
  return (
    <div className="flex items-start gap-xs">
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${swatch}`} aria-hidden />
      <div>
        <dt className="text-on-surface-variant">{term}</dt>
        <dd className="font-mono font-medium text-on-surface">{value}</dd>
        {hint && <p className="mt-0.5 max-w-[22ch] text-on-surface-variant">{hint}</p>}
      </div>
    </div>
  )
}
