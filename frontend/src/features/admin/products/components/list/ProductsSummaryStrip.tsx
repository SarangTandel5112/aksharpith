import { StatusBadge } from "@shared/components/admin";
import type React from "react";

type SummaryItem = {
  label: string;
  value: string;
  tone?: "success" | "neutral" | "info";
};

type ProductsSummaryStripProps = {
  items: SummaryItem[];
};

export function ProductsSummaryStrip(
  props: ProductsSummaryStripProps,
): React.JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {props.items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.25rem] border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                {item.label}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-zinc-950">
                {item.value}
              </p>
            </div>
            <StatusBadge
              label={item.tone === "success" ? "Healthy" : item.tone === "info" ? "Visible" : "Current"}
              variant={item.tone ?? "neutral"}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
