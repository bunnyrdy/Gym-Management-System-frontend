import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  CmsPage, CmsSection, RowControls, VisibilityChip, movedOrder,
} from '@/features/site/components/cms-shell'
import {
  useSiteOffers, useSaveOffer, useDeleteSiteItem, useReorder,
} from '@/features/site/hooks/use-site'
import {
  offerSchema, EMPTY_OFFER, type OfferFormValues,
} from '@/features/site/schemas/site.schemas'
import type { SiteOffer } from '@/features/site/types/site'

/**
 * Promotions.
 *
 * The form is inline rather than a separate route: an offer is four fields, and
 * a full-page form for four fields means two navigations to fix a typo. The
 * heavier content types (transformations, events) keep their own screens.
 */
export default function WebsiteOffersPage() {
  const [editing, setEditing] = useState<SiteOffer | null>(null)
  const [adding, setAdding] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)

  const { data, isLoading } = useSiteOffers({ pageSize: 100 })
  const save = useSaveOffer()
  const remove = useDeleteSiteItem('offers')
  const reorder = useReorder('offers')

  const items = data?.items ?? []
  const open = adding || editing !== null

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: EMPTY_OFFER,
  })

  function startAdd() {
    form.reset(EMPTY_OFFER)
    setEditing(null)
    setAdding(true)
  }

  function startEdit(offer: SiteOffer) {
    form.reset({
      title: offer.title,
      valueLabel: offer.valueLabel ?? '',
      description: offer.description ?? '',
      displayOrder: offer.displayOrder,
      isActive: offer.isActive,
    })
    setAdding(false)
    setEditing(offer)
  }

  function close() {
    setAdding(false)
    setEditing(null)
  }

  function submit(values: OfferFormValues) {
    save.mutate(
      { id: editing?.id, values },
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
      title="Offers"
      subtitle="The promotions strip under the membership plans."
      action={
        <Button type="button" variant="primary" size="sm" onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add offer
        </Button>
      }
    >
      {open && (
        <CmsSection title={editing ? 'Edit offer' : 'New offer'}>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-md">
            <div className="grid gap-md lg:grid-cols-2">
              <FormField label="Title" htmlFor="title" error={errors.title?.message}>
                <Input
                  id="title"
                  placeholder="Join Today & Get 10% Off"
                  error={!!errors.title}
                  {...form.register('title')}
                />
              </FormField>

              <FormField
                label="Headline value"
                htmlFor="valueLabel"
                error={errors.valueLabel?.message}
                labelRight={<span className="text-label-sm text-on-surface-variant">optional</span>}
              >
                <Input
                  id="valueLabel"
                  placeholder="10% OFF"
                  error={!!errors.valueLabel}
                  {...form.register('valueLabel')}
                />
              </FormField>
            </div>

            <FormField label="Description" htmlFor="description" error={errors.description?.message}>
              <Textarea
                id="description"
                rows={3}
                placeholder="Valid for new members on annual plans."
                error={!!errors.description}
                {...form.register('description')}
              />
            </FormField>

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
                {editing ? 'Save offer' : 'Add offer'}
              </Button>
            </div>
          </form>
        </CmsSection>
      )}

      <CmsSection
        title="Current offers"
        description="Only published offers appear on the site. The order here is the order they render in."
      >
        {isLoading ? (
          <div className="grid place-items-center py-xl">
            <Spinner className="text-primary-container" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-outline-variant px-md py-xl text-center text-body-md text-on-surface-variant">
            No offers yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant">
            {items.map((offer, index) => (
              <li key={offer.id} className="flex flex-wrap items-center gap-sm py-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-sm">
                    <p className="text-body-md font-medium text-on-surface">{offer.title}</p>
                    {offer.valueLabel && (
                      <span className="rounded-full bg-primary-container/10 px-2 py-0.5 font-mono text-label-sm font-bold uppercase text-primary-container">
                        {offer.valueLabel}
                      </span>
                    )}
                    <VisibilityChip isActive={offer.isActive} />
                  </div>
                  {offer.description && (
                    <p className="mt-0.5 text-label-md text-on-surface-variant">
                      {offer.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => startEdit(offer)}
                  aria-label={`Edit ${offer.title}`}
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
                  onDelete={() => setPendingDelete(offer.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </CmsSection>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this offer?"
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
