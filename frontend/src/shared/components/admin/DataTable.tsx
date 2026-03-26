"use client";

import { Checkbox } from "@shared/components/ui/checkbox";
import { Skeleton } from "@shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import { cn } from "@shared/lib/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
} from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Column<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type SortDir = "asc" | "desc";

type SortState = {
  key: string;
  dir: SortDir;
};

type RowId = string | number;

type DataTableProps<T extends { id: RowId }> = {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  // Slots
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  // Selection
  selectable?: boolean;
  onSelectionChange?: (ids: T["id"][]) => void;
  // Row actions (renders ⋯ button area)
  renderActions?: (row: T) => React.ReactNode;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SKELETON_ROW_COUNT = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortRows<T extends { id: RowId }>(
  rows: T[],
  sort: SortState | null,
): T[] {
  if (!sort) return rows;

  return [...rows].sort((a, b) => {
    const av = a[sort.key as keyof T];
    const bv = b[sort.key as keyof T];

    let cmp = 0;
    if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv;
    } else {
      cmp = String(av ?? "").localeCompare(String(bv ?? ""));
    }
    return sort.dir === "asc" ? cmp : -cmp;
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DataTable<T extends { id: RowId }>(
  props: DataTableProps<T>,
): React.JSX.Element {
  const [sort, setSort] = useState<SortState | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<T["id"]>>(new Set());

  const displayRows = sortRows(props.rows, sort);
  const colSpan =
    props.columns.length +
    (props.selectable ? 1 : 0) +
    (props.renderActions ? 1 : 0);

  function toggleSort(key: string): void {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  }

  function toggleRow(id: T["id"]): void {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      props.onSelectionChange?.(Array.from(next));
      return next;
    });
  }

  function toggleAll(): void {
    setSelectedIds((prev) => {
      const allIds = displayRows.map((r) => r.id);
      const isAllSelected = allIds.every((id) => prev.has(id));
      const next = isAllSelected ? new Set<T["id"]>() : new Set(allIds);
      props.onSelectionChange?.(Array.from(next));
      return next;
    });
  }

  const allSelected =
    displayRows.length > 0 && displayRows.every((r) => selectedIds.has(r.id));
  const someSelected =
    !allSelected && displayRows.some((r) => selectedIds.has(r.id));

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white shadow-sm">
      {props.toolbar}

      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200 bg-zinc-50/80 hover:bg-zinc-50/80">
            {props.selectable && (
              <TableHead className="w-10 py-4 pl-5">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {props.columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={cn(
                  "py-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500",
                  col.sortable && "cursor-pointer select-none",
                  col.className,
                )}
                onClick={col.sortable ? () => toggleSort(String(col.key)) : undefined}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-zinc-400">
                      {sort?.key === String(col.key) ? (
                        sort.dir === "asc" ? (
                          <IconChevronUp className="h-3 w-3" />
                        ) : (
                          <IconChevronDown className="h-3 w-3" />
                        )
                      ) : (
                        <IconSelector className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
            {props.renderActions && (
              <TableHead className="w-24 py-4 pr-5 text-right text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
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
            ).map((key) => (
              <TableRow key={key} data-testid="skeleton-row">
                {props.selectable && (
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableCell>
                )}
                {props.columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
                {props.renderActions && (
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-16 rounded" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : displayRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-20 text-center">
                <p className="text-sm font-semibold text-zinc-700">
                  {props.emptyMessage ?? "No results."}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {props.emptySubMessage ?? "Add a new record to get started."}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            displayRows.map((row) => (
              <TableRow
                key={row.id}
                data-state={selectedIds.has(row.id) ? "selected" : undefined}
                className={cn(
                  "border-b border-zinc-100 last:border-b-0 transition-colors hover:bg-zinc-50/70",
                  selectedIds.has(row.id) && "bg-zinc-50/70",
                )}
              >
                {props.selectable && (
                  <TableCell className="pl-5">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {props.columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={cn("py-4 text-sm text-zinc-700", col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "—")}
                  </TableCell>
                ))}
                {props.renderActions && (
                  <TableCell className="pr-5 text-right">
                    {props.renderActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {props.footer}
    </div>
  );
}
