import { TableCard } from '@/components/ui/list-shell'
import { Spinner } from '@/components/ui/spinner'
import type { Column } from '@/features/payments/components/payment-columns'

/**
 * The table, driven by a column descriptor list.
 *
 * Generic over the row so the payments page can hand it either ledger
 * transactions or members and still be type-checked end to end — the tabs read
 * two different endpoints, and this is the seam that keeps that from becoming
 * two pages.
 *
 * TableCard is reused verbatim: it already owns the header styling and the
 * pagination footer.
 */
export function PaymentsTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  emptyMessage,
  page,
  totalPages,
  totalCount,
  onPage,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => number | string
  isLoading: boolean
  isError: boolean
  emptyMessage: string
  page: number
  totalPages: number
  totalCount: number
  onPage: (next: number) => void
}) {
  const span = columns.length

  return (
    <TableCard
      headers={columns.map((c) => c.header)}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPage={onPage}
    >
      {isLoading && (
        <tr>
          <td colSpan={span} className="px-md py-xl text-center">
            <Spinner className="mx-auto text-primary-container" />
          </td>
        </tr>
      )}

      {isError && !isLoading && (
        <tr>
          <td colSpan={span} className="px-md py-xl text-center text-body-md text-error">
            Could not load payments. Try again.
          </td>
        </tr>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <tr>
          <td colSpan={span} className="px-md py-xl text-center text-body-md text-on-surface-variant">
            {emptyMessage}
          </td>
        </tr>
      )}

      {!isLoading &&
        !isError &&
        rows.map((row) => (
          <tr key={rowKey(row)} className="transition-colors hover:bg-surface-container-low">
            {columns.map((col, i) => (
              <td key={i} className="px-md py-sm">
                {col.cell(row)}
              </td>
            ))}
          </tr>
        ))}
    </TableCard>
  )
}
