import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil } from 'lucide-react'
import { assetUrl } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { prepareImage } from '@/utils/image'
import {
  CmsPage, CmsSection, RowControls, VisibilityChip, movedOrder,
} from '@/features/site/components/cms-shell'
import {
  useSiteEvents, useSaveEvent, useDeleteSiteItem, useReorder,
} from '@/features/site/hooks/use-site'
import {
  eventSchema, EMPTY_EVENT, type EventFormValues,
} from '@/features/site/schemas/site.schemas'
import { eventTimeLabel, type SiteEvent } from '@/features/site/types/site'

/**
 * Classes, challenges and workshops.
 *
 * Dates and times use the native `<input type="date">` and `type="time">`
 * rather than a picker library — they are keyboard-accessible, localised and
 * touch-friendly for free, and they hand back exactly the `YYYY-MM-DD` /
 * `HH:mm` strings the API wants.
 *
 * The list shows past events too. The public page hides them (the server
 * filters on the branch's own "today"), but an editor needs to see what has
 * already run to copy it forward.
 */
export default function WebsiteEventsPage() {
  const [editing, setEditing] = useState<SiteEvent | null>(null)
  const [adding, setAdding] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useSiteEvents({ pageSize: 100 })
  const save = useSaveEvent()
  const remove = useDeleteSiteItem('events')
  const reorder = useReorder('events')

  const items = data?.items ?? []
  const open = adding || editing !== null

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: EMPTY_EVENT,
  })

  function startAdd() {
    form.reset(EMPTY_EVENT)
    setImage(null)
    setEditing(null)
    setAdding(true)
  }

  function startEdit(row: SiteEvent) {
    form.reset({
      title: row.title,
      eventDate: row.eventDate,
      // The API returns HH:mm:ss; the native time input wants HH:mm.
      startTime: row.startTime?.slice(0, 5) ?? '',
      endTime: row.endTime?.slice(0, 5) ?? '',
      location: row.location ?? '',
      description: row.description ?? '',
      isActive: row.isActive,
      displayOrder: row.displayOrder,
    })
    setImage(null)
    setAdding(false)
    setEditing(row)
  }

  function close() {
    setAdding(false)
    setEditing(null)
    setImage(null)
  }

  function submit(values: EventFormValues) {
    save.mutate(
      { id: editing?.id, values, image: image ?? undefined },
      { onSuccess: close },
    )
  }

  function move(index: number, direction: -1 | 1) {
    const next = movedOrder(items, index, direction)
    if (next) reorder.mutate(next)
  }

  const { errors } = form.formState
  const preview = image ? URL.createObjectURL(image) : assetUrl(editing?.imageUrl ?? null)

  return (
    <CmsPage
      title="Events"
      subtitle="Upcoming classes, challenges and workshops."
      action={
        <Button type="button" variant="primary" size="sm" onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add event
        </Button>
      }
    >
      {open && (
        <CmsSection title={editing ? 'Edit event' : 'New event'}>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-md">
            <div className="grid gap-md lg:grid-cols-2">
              <FormField label="Name" htmlFor="title" error={errors.title?.message}>
                <Input
                  id="title"
                  placeholder="30-Day Challenge"
                  error={!!errors.title}
                  {...form.register('title')}
                />
              </FormField>

              <FormField label="Date" htmlFor="eventDate" error={errors.eventDate?.message}>
                <Input
                  id="eventDate"
                  type="date"
                  error={!!errors.eventDate}
                  {...form.register('eventDate')}
                />
              </FormField>

              <FormField label="Start time" htmlFor="startTime" error={errors.startTime?.message}>
                <Input id="startTime" type="time" {...form.register('startTime')} />
              </FormField>

              <FormField
                label="End time"
                htmlFor="endTime"
                error={errors.endTime?.message}
                labelRight={<span className="text-label-sm text-on-surface-variant">optional</span>}
              >
                <Input id="endTime" type="time" {...form.register('endTime')} />
              </FormField>

              <FormField label="Location" htmlFor="location" error={errors.location?.message}>
                <Input id="location" placeholder="Main floor" {...form.register('location')} />
              </FormField>
            </div>

            <FormField label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea id="description" rows={3} {...form.register('description')} />
            </FormField>

            <div className="flex flex-col gap-sm">
              <p className="font-mono text-label-md font-medium text-on-surface">Cover image</p>
              <div className="grid aspect-[16/9] w-full max-w-xs place-items-center overflow-hidden rounded-md border border-dashed border-outline-variant bg-surface-container-low">
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-label-md text-on-surface-variant">No image</span>
                )}
              </div>
              <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={async (e) => {
                  const picked = e.target.files?.[0]
                  e.target.value = ''
                  if (picked) setImage(await prepareImage(picked, 1600))
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit"
                onClick={() => input.current?.click()}
              >
                {preview ? 'Replace image' : 'Choose image'}
              </Button>
            </div>

            <ToggleSwitch
              id="isActive"
              label={form.watch('isActive') ? 'Published' : 'Hidden'}
              checked={!!form.watch('isActive')}
              onChange={(next) => form.setValue('isActive', next, { shouldDirty: true })}
            />

            <div className="flex justify-end gap-sm">
              <Button type="button" variant="ghost" size="sm" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={save.isPending}>
                {editing ? 'Save event' : 'Add event'}
              </Button>
            </div>
          </form>
        </CmsSection>
      )}

      <CmsSection
        title="All events"
        description="Past events stay here so they can be copied forward; the public page shows only what is still to come."
      >
        {isLoading ? (
          <div className="grid place-items-center py-xl">
            <Spinner className="text-primary-container" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-outline-variant px-md py-xl text-center text-body-md text-on-surface-variant">
            No events yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant">
            {items.map((row, index) => (
              <li key={row.id} className="flex flex-wrap items-center gap-sm py-sm">
                {row.imageUrl ? (
                  <img
                    src={assetUrl(row.imageUrl) ?? undefined}
                    alt=""
                    className="h-14 w-24 shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-14 w-24 shrink-0 rounded bg-surface-container" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-sm">
                    <p className="text-body-md font-medium text-on-surface">{row.title}</p>
                    <VisibilityChip isActive={row.isActive} />
                  </div>
                  <p className="mt-0.5 text-label-md text-on-surface-variant">
                    {row.eventDate}
                    {eventTimeLabel(row.startTime, row.endTime) &&
                      ` · ${eventTimeLabel(row.startTime, row.endTime)}`}
                    {row.location && ` · ${row.location}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  aria-label={`Edit ${row.title}`}
                  className="grid h-8 w-8 place-items-center rounded text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                <RowControls
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  busy={reorder.isPending || remove.isPending}
                  onUp={() => move(index, -1)}
                  onDown={() => move(index, 1)}
                  onDelete={() => setPendingDelete(row.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </CmsSection>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this event?"
        body="It will be removed from the website. This cannot be undone."
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete !== null) remove.mutate(pendingDelete)
          setPendingDelete(null)
        }}
      />
    </CmsPage>
  )
}
