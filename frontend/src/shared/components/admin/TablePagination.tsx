"use client";

import { Button } from "@shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import type React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type TablePaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Component ─────────────────────────────────────────────────────────────────

export function TablePagination(props: TablePaginationProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(props.total / props.pageSize));
  const start = props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1;
  const end = Math.min(props.page * props.pageSize, props.total);
  const options = props.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
      <p className="text-xs text-zinc-500">
        {props.total === 0
          ? "No results"
          : `Showing ${start}–${end} of ${props.total}`}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500">Rows per page</span>
          <Select
            value={String(props.pageSize)}
            onValueChange={(v) => {
              props.onPageSizeChange(Number(v));
              props.onPageChange(1);
            }}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-zinc-500">
          Page {props.page} of {totalPages}
        </span>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => props.onPageChange(1)}
            disabled={props.page <= 1}
          >
            <IconChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => props.onPageChange(props.page - 1)}
            disabled={props.page <= 1}
          >
            <IconChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => props.onPageChange(props.page + 1)}
            disabled={props.page >= totalPages}
          >
            <IconChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => props.onPageChange(totalPages)}
            disabled={props.page >= totalPages}
          >
            <IconChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
