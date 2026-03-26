"use client";

import type { ProductWorkspaceTab } from "@features/admin/products/types/products.types";
import { cn } from "@shared/lib/utils";
import type React from "react";

type ProductWorkspaceTabsProps = {
  tabs: ProductWorkspaceTab[];
  activeTab: ProductWorkspaceTab["key"];
  onChange: (tab: ProductWorkspaceTab["key"]) => void;
};

export function ProductWorkspaceTabs(
  props: ProductWorkspaceTabsProps,
): React.JSX.Element {
  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-zinc-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {props.tabs.map((tab) => {
          const isActive = tab.key === props.activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => props.onChange(tab.key)}
              className={cn(
                "min-w-44 rounded-2xl px-4 py-3 text-left transition-colors",
                isActive
                  ? "bg-zinc-950 text-white"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <p className="text-sm font-medium">{tab.label}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  isActive ? "text-zinc-200" : "text-zinc-500",
                )}
              >
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
