import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, ShieldCheck, ShieldAlert } from 'lucide-react'
import { assetUrl } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Alert } from '@/components/common/alert'
import { prepareImage } from '@/utils/image'
import {
  CmsPage, CmsSection, RowControls, VisibilityChip, movedOrder,
} from '@/features/site/components/cms-shell'
import {
  useSiteTransformations, useSaveTransformation, useDeleteSiteItem, useReorder,
} from '@/features/site/hooks/use-site'
import {
  transformationSchema, EMPTY_TRANSFORMATION, type TransformationFormValues,
} from '@/features/site/schemas/site.schemas'
import type { SiteTransformation } from '@/features/site/types/site'

/**
 * Success stories — the one CMS screen that handles personal data.
 *
 * Publishing here puts a member's name and body photographs on the open
 * internet, which is a purpose distinct from the membership they signed up for.
 * The consent tick is therefore not a formality:
 *
 *  * the Published toggle is disabled until it is ticked;
 *  * the zod schema refuses the combination even if the toggle is forced;
 *  * the server refuses it again and stamps the date and the staff account
 *    itself, so a consent cannot be back-dated from here;
 *  * a DB CHECK is behind all three.
 *
 * Un-ticking it takes the story off the site on the next load. That is the
 * withdrawal path, and it is why the checkbox copy says so out loud.
 */
function PhotoField({
  label,
  file,
  existingUrl,
  onPick,
  error,
}: {
  label: string
  file: File | null
  existingUrl: string | null
  onPick: (file: File | null) => void
  error?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : assetUrl(existingUrl)

  return (
    <div className="flex flex-col gap-sm">
      <p className="font-mono text-label-md font-medium text-on-surface">{label}</p>

      <div className="grid aspect-[3/4] w-full max-w-[180px] place-items-center overflow-hidden rounded-md border border-dashed border-outline-variant bg-surface-container-low">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-label-md text-on-surface-variant">
            No photo
          </span>
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
          if (picked) onPick(await prepareImage(picked, 1200))
        }}
      />
      <Button type="button" variant="secondary" size="sm" onClick={() => input.current?.click()}>
        {preview ? 'Replace' : 'Choose photo'}
      </Button>

      {error && <p className="text-label-md text-error">{error}</p>}
    </div>
  )
}

export default function WebsiteTransformationsPage() {
  const [editing, setEditing] = useState<SiteTransformation | null>(null)
  const [adding, setAdding] = useState(false)
  const [before, setBefore] = useState<File | null>(null)
  const [after, setAfter] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)

  const { data, isLoading } = useSiteTransformations({ pageSize: 100 })
  const save = useSaveTransformation()
  const remove = useDeleteSiteItem('transformations')
  const reorder = useReorder('transformations')

  const items = data?.items ?? []
  const open = adding || editing !== null

  const form = useForm<TransformationFormValues>({
    resolver: zodResolver(transformationSchema),
    defaultValues: EMPTY_TRANSFORMATION,
  })

  const consentGiven = !!form.watch('consentGiven')
  const isActive = !!form.watch('isActive')

  function reset() {
    setBefore(null)
    setAfter(null)
    setPhotoError(null)
  }

  function startAdd() {
    form.reset(EMPTY_TRANSFORMATION)
    reset()
    setEditing(null)
    setAdding(true)
  }

  function startEdit(row: SiteTransformation) {
    form.reset({
      memberId: row.memberId ?? '',
      displayName: row.displayName,
      goal: row.goal ?? '',
      achievement: row.achievement ?? '',
      durationLabel: row.durationLabel ?? '',
      description: row.description ?? '',
      consentGiven: row.consentGivenAt !== null,
      isActive: row.isActive,
      displayOrder: row.displayOrder,
    })
    reset()
    setAdding(false)
    setEditing(row)
  }

  function close() {
    setAdding(false)
    setEditing(null)
    reset()
  }

  function submit(values: TransformationFormValues) {
    // Both photos are required to create; on an edit the existing pair stands
    // unless a replacement was picked.
    if (!editing && (!before || !after)) {
      setPhotoError('Add both a before and an after photo.')
      return
    }
    setPhotoError(null)

    save.mutate(
      { id: editing?.id, values, before: before ?? undefined, after: after ?? undefined },
      { onSuccess: close },
    )
  }

  function move(index: number, direction: -1 | 1) {
    const next = movedOrder(items, index, direction)
    if (next) reorder.mutate(next)
  }

  const { errors } = form.formState

  return (
    <CmsPage
      title="Transformations"
      subtitle="Member success stories on the public site."
      action={
        <Button type="button" variant="primary" size="sm" onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add story
        </Button>
      }
    >
      {open && (
        <CmsSection title={editing ? 'Edit story' : 'New story'}>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-md">
            <div className="grid gap-md lg:grid-cols-2">
              <FormField
                label="Name shown publicly"
                htmlFor="displayName"
                error={errors.displayName?.message}
              >
                <Input
                  id="displayName"
                  placeholder="Rahul S."
                  error={!!errors.displayName}
                  {...form.register('displayName')}
                />
              </FormField>

              <FormField
                label="Member ID"
                htmlFor="memberId"
                error={errors.memberId?.message}
                labelRight={<span className="text-label-sm text-on-surface-variant">optional</span>}
              >
                <Input
                  id="memberId"
                  inputMode="numeric"
                  placeholder="Link to a member record"
                  error={!!errors.memberId}
                  {...form.register('memberId')}
                />
              </FormField>

              <FormField label="Goal" htmlFor="goal" error={errors.goal?.message}>
                <Input id="goal" placeholder="Muscle Gain" {...form.register('goal')} />
              </FormField>

              <FormField label="Achievement" htmlFor="achievement" error={errors.achievement?.message}>
                <Input
                  id="achievement"
                  placeholder="Gained 8 kg muscle"
                  {...form.register('achievement')}
                />
              </FormField>

              <FormField label="Duration" htmlFor="durationLabel" error={errors.durationLabel?.message}>
                <Input id="durationLabel" placeholder="6 Months" {...form.register('durationLabel')} />
              </FormField>
            </div>

            <FormField label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea id="description" rows={3} {...form.register('description')} />
            </FormField>

            <div className="flex flex-wrap gap-md">
              <PhotoField
                label="Before"
                file={before}
                existingUrl={editing?.beforeImageUrl ?? null}
                onPick={setBefore}
              />
              <PhotoField
                label="After"
                file={after}
                existingUrl={editing?.afterImageUrl ?? null}
                onPick={setAfter}
                error={photoError ?? undefined}
              />
            </div>

            <Alert variant="info">
              This story publishes the member's name and photographs to anyone on the
              internet. Record their consent before publishing, and un-tick it to take the
              story down.
            </Alert>

            <Checkbox
              label="The member has consented to this being published"
              {...form.register('consentGiven')}
            />
            {errors.consentGiven?.message && (
              <p className="text-label-md text-error">{errors.consentGiven.message}</p>
            )}

            <ToggleSwitch
              id="isActive"
              label={isActive ? 'Published' : 'Hidden'}
              checked={isActive}
              onChange={(next) => {
                // The gate, at the point of interaction: without consent the
                // toggle cannot be turned on at all.
                if (next && !consentGiven) return
                form.setValue('isActive', next, { shouldDirty: true })
              }}
            />
            {!consentGiven && (
              <p className="text-label-md text-on-surface-variant">
                Record consent above before this story can be published.
              </p>
            )}

            <div className="flex justify-end gap-sm">
              <Button type="button" variant="ghost" size="sm" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={save.isPending}>
                {editing ? 'Save story' : 'Add story'}
              </Button>
            </div>
          </form>
        </CmsSection>
      )}

      <CmsSection
        title="Stories"
        description="Only published stories with recorded consent appear on the site."
      >
        {isLoading ? (
          <div className="grid place-items-center py-xl">
            <Spinner className="text-primary-container" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-outline-variant px-md py-xl text-center text-body-md text-on-surface-variant">
            No stories yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant">
            {items.map((row, index) => (
              <li key={row.id} className="flex flex-wrap items-center gap-sm py-sm">
                <div className="flex w-20 shrink-0 gap-0.5">
                  <img
                    src={assetUrl(row.beforeImageUrl) ?? undefined}
                    alt=""
                    className="h-14 w-1/2 rounded-l object-cover"
                  />
                  <img
                    src={assetUrl(row.afterImageUrl) ?? undefined}
                    alt=""
                    className="h-14 w-1/2 rounded-r object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-sm">
                    <p className="text-body-md font-medium text-on-surface">{row.displayName}</p>
                    <VisibilityChip isActive={row.isActive} />
                    {row.consentGivenAt ? (
                      <span className="flex items-center gap-1 font-mono text-label-sm text-status-active">
                        <ShieldCheck className="h-3.5 w-3.5" /> Consented
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-label-sm text-status-pending">
                        <ShieldAlert className="h-3.5 w-3.5" /> No consent
                      </span>
                    )}
                  </div>
                  {row.goal && (
                    <p className="mt-0.5 text-label-md text-on-surface-variant">Goal: {row.goal}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  aria-label={`Edit ${row.displayName}`}
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
        title="Delete this story?"
        body="The story and both photographs are permanently deleted. This is also how you honour a request to remove them."
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
