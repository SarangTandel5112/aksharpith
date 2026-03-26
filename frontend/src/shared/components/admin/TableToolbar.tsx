"use client";

import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { IconSearch, IconX } from "@tabler/icons-react";
import type React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TableToolbarFilterOption = {
  label: string;
  value: string;
};

export type TableToolbarFilter = {
  id: string;
  label: string;
  value: string;
  options: TableToolbarFilterOption[];
  onChange: (value: string) => void;
  allLabel?: string;
};

type TableToolbarProps = {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  action?: React.ReactNode;
  bulkActions?: React.ReactNode;
  selectedCount?: number;
  filters?: TableToolbarFilter[];
  onClearFilters?: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TableToolbar(props: TableToolbarProps): React.JSX.Element {
  const showBulk =
    props.bulkActions !== undefined &&
    props.selectedCount !== undefined &&
    props.selectedCount > 0;
  const hasActiveFilters =
    props.filters?.some((filter) => filter.value !== "all") ?? false;
  const canClear = props.onClearFilters !== undefined && (
    props.search.length > 0 || hasActiveFilters
  );

  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={props.search}
            onChange={(e) => props.onSearch(e.target.value)}
            placeholder={props.placeholder ?? "Search…"}
            className="w-full pl-10 pr-10 text-sm"
          />
          {props.search.length > 0 && (
            <button
              type="button"
              onClick={() => props.onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {props.filters && props.filters.length > 0 ? (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {props.filters.map((filter) => (
              <Select
                key={filter.id}
                value={filter.value}
                onValueChange={filter.onChange}
              >
                <SelectTrigger className="h-9 w-full min-w-[150px] sm:w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {filter.allLabel ?? `All ${filter.label}`}
                  </SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={props.onClearFilters}
              >
                <IconX className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        ) : null}

        {showBulk && (
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
            <span className="text-xs font-medium text-zinc-500">
              {props.selectedCount} selected
            </span>
            {props.bulkActions}
          </div>
        )}
      </div>

      {props.action && <div className="shrink-0">{props.action}</div>}
    </div>
  );
}
