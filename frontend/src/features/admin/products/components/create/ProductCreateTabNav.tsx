import type {
  ProductCreateTabDefinition,
  ProductCreateTabKey,
} from "@features/admin/products/types/product-create.types";
import { cn } from "@shared/lib/utils";
import type React from "react";

type ProductCreateTabNavProps = {
  tabs: ProductCreateTabDefinition[];
  activeTab: ProductCreateTabKey;
  onChange: (tab: ProductCreateTabKey) => void;
};

export function ProductCreateTabNav(
  props: ProductCreateTabNavProps,
): React.JSX.Element {
  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-zinc-200 bg-white shadow-sm">
      <div className="flex min-w-max gap-1 p-2">
        {props.tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => props.onChange(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors",
              props.activeTab === tab.key
                ? "bg-zinc-950 text-white"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  props.activeTab === tab.key
                    ? "bg-white/15 text-white"
                    : "bg-zinc-100 text-zinc-600",
                )}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
