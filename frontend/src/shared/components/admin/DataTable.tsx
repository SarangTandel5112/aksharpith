import { Skeleton } from "@shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import { cn } from "@shared/lib/cn";

type Column<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  rows: T[];
  isLoading: boolean;
  emptyMessage?: string;
  renderActions?: (row: T) => React.ReactNode;
};

const SKELETON_ROW_COUNT = 5;

export function DataTable<T extends { id: string }>(
  props: DataTableProps<T>,
): React.JSX.Element {
  const colSpan = props.columns.length + (props.renderActions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-zinc-50 border-b">
            {props.columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className="text-xs font-semibold uppercase tracking-wide text-zinc-500 py-3"
              >
                {col.label}
              </TableHead>
            ))}
            {props.renderActions && (
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 py-3">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.isLoading ? (
            Array.from(
              { length: SKELETON_ROW_COUNT },
              (_, i) => `skeleton-${i}`,
            ).map((skeletonKey) => (
              <TableRow key={skeletonKey} data-testid="skeleton-row">
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
          ) : props.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-16 text-center">
                <p className="text-sm font-medium text-zinc-500">
                  {props.emptyMessage ?? "No results."}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Add a new record to get started
                </p>
              </TableCell>
            </TableRow>
          ) : (
            props.rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-zinc-50 border-b last:border-b-0 transition-colors"
              >
                {props.columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={cn(
                      "py-3.5 text-sm text-zinc-700",
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "—")}
                  </TableCell>
                ))}
                {props.renderActions && (
                  <TableCell className="text-right">
                    {props.renderActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
