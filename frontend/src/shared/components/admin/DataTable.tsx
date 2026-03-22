import { Skeleton } from '@shared/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/components/ui/table'

type Column<T> = {
  key:        keyof T
  label:      string
  className?: string
}

type DataTableProps<T extends { id: string }> = {
  columns:        Column<T>[]
  rows:           T[]
  isLoading:      boolean
  emptyMessage?:  string
  renderActions?: (row: T) => React.ReactNode
}

const SKELETON_ROW_COUNT = 5

export function DataTable<T extends { id: string }>(
  props: DataTableProps<T>,
): React.JSX.Element {
  const colSpan = props.columns.length + (props.renderActions ? 1 : 0)

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {props.columns.map((col) => (
              <TableHead key={String(col.key)} className="font-semibold text-muted-foreground">
                {col.label}
              </TableHead>
            ))}
            {props.renderActions && (
              <TableHead className="text-right font-semibold text-muted-foreground">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.isLoading
            ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <TableRow key={i} data-testid="skeleton-row">
                  {props.columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                  {props.renderActions && (
                    <TableCell>
                      <Skeleton className="h-4 w-16 ml-auto rounded" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            : props.rows.length === 0
              ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    {props.emptyMessage ?? 'No results.'}
                  </TableCell>
                </TableRow>
              )
              : props.rows.map((row) => (
                <TableRow key={row.id}>
                  {props.columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {String(row[col.key] ?? '—')}
                    </TableCell>
                  ))}
                  {props.renderActions && (
                    <TableCell className="text-right">
                      {props.renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
