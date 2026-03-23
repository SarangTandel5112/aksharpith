"use client";

import { Input } from "@shared/components/ui/input";
import { IconSearch, IconX } from "@tabler/icons-react";
import type React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type TableToolbarProps = {
  search: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  action?: React.ReactNode;
  bulkActions?: React.ReactNode;
  selectedCount?: number;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function TableToolbar(props: TableToolbarProps): React.JSX.Element {
  const showBulk =
    props.bulkActions !== undefined &&
    props.selectedCount !== undefined &&
    props.selectedCount > 0;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <Input
            value={props.search}
            onChange={(e) => props.onSearch(e.target.value)}
            placeholder={props.placeholder ?? "Search…"}
            className="h-8 w-56 pl-8 text-sm"
          />
          {props.search.length > 0 && (
            <button
              type="button"
              onClick={() => props.onSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {showBulk && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {props.selectedCount} selected
            </span>
            {props.bulkActions}
          </div>
        )}
      </div>

      {props.action && <div>{props.action}</div>}
    </div>
  );
}
