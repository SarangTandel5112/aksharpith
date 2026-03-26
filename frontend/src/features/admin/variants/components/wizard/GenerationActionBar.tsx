import { SectionCard, StatusBadge } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import type React from "react";

type GenerationActionBarProps = {
  selectedCount: number;
  generatedCount: number;
  isSubmitting: boolean;
  status: "idle" | "success";
  onGenerate: () => void;
  onReset: () => void;
};

export function GenerationActionBar(
  props: GenerationActionBarProps,
): React.JSX.Element {
  return (
    <SectionCard
      title="Generate Lot Matrix"
      description="Create the lot matrix combinations for the selected attributes."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Selected Attributes
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {props.selectedCount}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Matrix Outcomes
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {props.generatedCount}
          </p>
        </div>
        <div className="rounded-2xl bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Status
          </p>
          <div className="mt-2">
            <StatusBadge
              label={props.status === "success" ? "Ready" : "Waiting"}
              variant={props.status === "success" ? "success" : "neutral"}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={props.selectedCount === 0 || props.isSubmitting}
          onClick={props.onGenerate}
        >
          {props.isSubmitting ? "Generating…" : "Generate Matrix"}
        </Button>
        <Button type="button" variant="outline" onClick={props.onReset}>
          Reset Selection
        </Button>
      </div>
    </SectionCard>
  );
}
