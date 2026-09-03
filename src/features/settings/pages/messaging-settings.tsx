import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Mail, Info } from 'lucide-react'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Chip, type ChipTone } from '@/components/ui/status-chip'
import { Alert } from '@/components/common/alert'
import { QuotaMeter } from '@/features/settings/components/quota-meter'
import { ReminderDays } from '@/features/settings/components/reminder-days'
import {
  useMessagingSettings, useMessageQueue, useSaveMessagingSettings,
} from '@/features/settings/hooks/use-settings'
import {
  messagingSettingsSchema, type MessagingSettingsFormValues,
} from '@/features/settings/schemas/settings.schemas'
import type { MessageStatus, QueuedMessage } from '@/features/settings/types/settings'

/**
 * Settings → Messaging.
 *
 * The screen exists for one question the owner cannot otherwise answer: is mail
 * going out, and how much of today's allowance is left. Everything else on it
 * follows from that.
 *
 * Two things it deliberately does not do:
 *
 *  * It never renders a message body. A pending password-reset row holds a live
 *    link, and the API's projection has no body field precisely so no screen
 *    can grow one.
 *  * It does not re-decide who may be here. The route is behind ManageSettings
 *    on the server; hiding the nav entry as well would put the rule in two
 *    places and one of them would go stale.
 */
const STATUS_TONES: Record<MessageStatus, ChipTone> = {
  pending: 'pending',
  sending: 'pending',
  sent: 'active',
  failed: 'error',
  skipped: 'inactive',
}

const PURPOSE_LABELS: Record<string, string> = {
  password_reset: 'Password reset',
  password_changed: 'Password changed',
  renewal_reminder: 'Renewal reminder',
  offer: 'Offer',
}

const SKIP_LABELS: Record<string, string> = {
  expired: 'Too old to send',
  member_inactive: 'Member not active',
  no_consent: 'No marketing consent',
  no_address: 'No email address',
  disabled: 'Sending was off',
}

export default function MessagingSettingsPage() {
  const { data, isLoading, isError } = useMessagingSettings()
  const save = useSaveMessagingSettings()
  const [statusFilter, setStatusFilter] = useState<MessageStatus | ''>('')
  const queue = useMessageQueue({ status: statusFilter, page: 1, pageSize: 20 })

  const {
    register, handleSubmit, control, reset, watch,
    formState: { errors, isDirty },
  } = useForm<MessagingSettingsFormValues>({
    resolver: zodResolver(messagingSettingsSchema),
    defaultValues: {
      emailsEnabled: true,
      suspendTransactional: false,
      dailyEmailLimit: 270,
      highPriorityReserve: 30,
      reminderDaysBefore: [3],
    },
  })

  // The server owns these values; the form is a view of them until edited.
  useEffect(() => {
    if (!data) return
    reset({
      emailsEnabled: data.emailsEnabled,
      suspendTransactional: data.suspendTransactional,
      dailyEmailLimit: data.dailyEmailLimit,
      highPriorityReserve: data.highPriorityReserve,
      reminderDaysBefore: data.reminderDaysBefore,
    })
  }, [data, reset])

  const enabled = watch('emailsEnabled')
  const suspendAll = watch('suspendTransactional')

  if (isLoading) {
    return (
      <div className="grid min-h-[24rem] place-items-center">
        <Spinner size="lg" className="text-primary-container" />
      </div>
    )
  }

  if (isError || !data) {
    return <Alert>Could not load the messaging settings.</Alert>
  }

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-headline-lg text-on-background">Settings</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Email the gym sends to members, and how much of the daily allowance it may spend.
        </p>
      </div>

      <nav aria-label="Settings sections" className="flex flex-wrap gap-xs border-b border-outline-variant">
        <span className="-mb-px border-b-2 border-primary-container px-md py-3 font-mono text-label-md font-medium text-primary-container">
          Messaging
        </span>
      </nav>

      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-lg">
        <Section title="Today" subtitle="Brevo's allowance resets on its own clock, not the gym's.">
          <QuotaMeter data={data} />

          <div className="mt-md flex flex-wrap gap-lg border-t border-outline-variant pt-md text-label-md">
            <p className="text-on-surface-variant">
              Waiting: <span className="font-mono font-medium text-on-surface">{data.pendingCount}</span>
            </p>
            <p className="text-on-surface-variant">
              Given up on:{' '}
              <span
                className={
                  data.failedCount > 0
                    ? 'font-mono font-medium text-error'
                    : 'font-mono font-medium text-on-surface'
                }
              >
                {data.failedCount}
              </span>
            </p>
          </div>
        </Section>

        <Section
          title="Sending"
          subtitle="The master switch. Nothing queued is lost while it is off — messages wait, and expire if they go stale."
        >
          <Controller
            control={control}
            name="emailsEnabled"
            render={({ field }) => (
              <ToggleSwitch
                id="emails-enabled"
                checked={field.value}
                onChange={field.onChange}
                label={field.value ? 'Sending email' : 'Not sending email'}
              />
            )}
          />

          {!enabled && (
            <div className="mt-md flex flex-col gap-md">
              <Alert variant="info">
                <span className="flex items-start gap-sm">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    Renewal reminders have stopped. Password reset links are still going out —
                    turn that off separately below if you really mean everything.
                  </span>
                </span>
              </Alert>

              <Controller
                control={control}
                name="suspendTransactional"
                render={({ field }) => (
                  <ToggleSwitch
                    id="suspend-transactional"
                    checked={field.value}
                    onChange={field.onChange}
                    label="Also stop password reset emails"
                  />
                )}
              />

              {suspendAll && (
                <Alert>
                  <span className="flex items-start gap-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      Nobody can reset a forgotten password while this is on — including you.
                      The only way back in is the password you already know.
                    </span>
                  </span>
                </Alert>
              )}
            </div>
          )}
        </Section>

        <Section
          title="Daily allowance"
          subtitle="How many emails a day, and how many of those are held back for password resets."
        >
          <div className="grid gap-md sm:grid-cols-2">
            <FormField label="Emails per day" htmlFor="dailyEmailLimit" error={errors.dailyEmailLimit?.message}>
              <Input
                id="dailyEmailLimit"
                type="number"
                inputMode="numeric"
                error={!!errors.dailyEmailLimit}
                {...register('dailyEmailLimit', { valueAsNumber: true })}
              />
              <p className="mt-1 text-label-md text-on-surface-variant">
                Brevo's free tier allows 300. Leave headroom for anything sent outside this queue.
              </p>
            </FormField>

            <FormField
              label="Held for password resets"
              htmlFor="highPriorityReserve"
              error={errors.highPriorityReserve?.message}
            >
              <Input
                id="highPriorityReserve"
                type="number"
                inputMode="numeric"
                error={!!errors.highPriorityReserve}
                {...register('highPriorityReserve', { valueAsNumber: true })}
              />
              <p className="mt-1 text-label-md text-on-surface-variant">
                Reminders can never spend these, however quiet the morning has been. It is what
                keeps a reset link working at 3pm.
              </p>
            </FormField>
          </div>
        </Section>

        <Section
          title="Renewal reminders"
          subtitle="When to tell a member their membership is about to lapse."
        >
          <FormField
            label="Remind them"
            htmlFor="reminderDaysBefore"
            error={errors.reminderDaysBefore?.message}
          >
            <Controller
              control={control}
              name="reminderDaysBefore"
              render={({ field }) => (
                <ReminderDays value={field.value} onChange={field.onChange} disabled={!enabled} />
              )}
            />
          </FormField>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" size="md" loading={save.isPending} disabled={!isDirty}>
            Save settings
          </Button>
        </div>
      </form>

      <Section
        title="Recent messages"
        subtitle="What the gym has sent, tried to send, or deliberately skipped."
      >
        <div className="mb-md flex flex-wrap gap-xs">
          {(['', 'pending', 'sent', 'failed', 'skipped'] as const).map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                statusFilter === s
                  ? 'rounded-full bg-on-surface px-md py-1.5 font-mono text-label-md text-surface-container-lowest'
                  : 'rounded-full bg-surface-container-high px-md py-1.5 font-mono text-label-md text-on-surface-variant transition-colors hover:text-on-surface'
              }
            >
              {s === '' ? 'All' : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {queue.isLoading ? (
          <div className="grid h-32 place-items-center">
            <Spinner className="text-primary-container" />
          </div>
        ) : !queue.data || queue.data.items.length === 0 ? (
          <p className="flex items-center gap-sm py-lg text-body-md text-on-surface-variant">
            <Mail className="h-4 w-4" aria-hidden /> Nothing here yet.
          </p>
        ) : (
          // Its own scroll container: without it one wide table scrolls the
          // whole document sideways, top bar and all.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-body-md">
              <thead>
                <tr className="border-b border-outline-variant text-left font-mono text-label-md text-on-surface-variant">
                  <th className="py-2 pr-md font-medium">To</th>
                  <th className="py-2 pr-md font-medium">Message</th>
                  <th className="py-2 pr-md font-medium">Status</th>
                  <th className="py-2 pr-md font-medium">Tries</th>
                  <th className="py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {queue.data.items.map((row) => (
                  <QueueRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  )
}

function QueueRow({ row }: { row: QueuedMessage }) {
  const when = new Date(row.sentAt ?? row.createdAt)

  return (
    <tr className="border-b border-outline-variant/60 last:border-0">
      <td className="py-3 pr-md text-on-surface">{row.toAddress}</td>
      <td className="py-3 pr-md text-on-surface-variant">
        {PURPOSE_LABELS[row.purpose] ?? row.purpose}
      </td>
      <td className="py-3 pr-md">
        <Chip
          tone={STATUS_TONES[row.status]}
          label={
            row.status === 'skipped' && row.skipReason
              ? (SKIP_LABELS[row.skipReason] ?? 'Skipped')
              : row.status[0].toUpperCase() + row.status.slice(1)
          }
        />
        {row.status === 'failed' && row.lastError && (
          <p className="mt-1 max-w-[28ch] truncate text-label-md text-on-surface-variant" title={row.lastError}>
            {row.lastError}
          </p>
        )}
      </td>
      <td className="py-3 pr-md font-mono text-on-surface-variant">{row.attempts}</td>
      <td className="py-3 text-on-surface-variant">
        {when.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
      </td>
    </tr>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-md border border-outline-variant bg-surface-container-lowest p-lg shadow-soft-lift">
      <h2 className="text-title-md text-on-surface">{title}</h2>
      <p className="mt-1 mb-md text-body-md text-on-surface-variant">{subtitle}</p>
      {children}
    </section>
  )
}
