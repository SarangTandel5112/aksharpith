"use client";

import { buildLotMatrixPreview } from "@features/admin/products/services/product-create.helpers";
import type { ProductLotMatrixRowDraft } from "@features/admin/products/types/product-create.types";
import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { SectionCard, StatusBadge } from "@shared/components/admin";
import type React from "react";

type LotMatrixSummaryPanelProps = {
  attributes: Attribute[];
  selectedAttributeIds: string[];
  possibleCount: number;
  draftRows: ProductLotMatrixRowDraft[];
  readyRows: number;
};

export function LotMatrixSummaryPanel(
  props: LotMatrixSummaryPanelProps,
): React.JSX.Element {
  const preview = buildLotMatrixPreview(
    props.attributes,
    props.selectedAttributeIds,
    6,
  );
  const rowsInTable = props.draftRows.length;
  const missingRows = Math.max(props.possibleCount - rowsInTable, 0);
  const tableStatusLabel =
    rowsInTable === 0
      ? "Not generated"
      : props.possibleCount > 0 && missingRows === 0
        ? "All rows in table"
        : props.possibleCount > 0
          ? `${missingRows} missing`
          : "Manual rows";
  const tableStatusVariant =
    rowsInTable === 0
      ? "warning"
      : props.possibleCount > 0 && missingRows === 0
        ? "success"
        : props.possibleCount > 0
          ? "warning"
          : "info";

  return (
    <SectionCard
      title="Matrix Overview"
      description="Use the generated rows to prepare sellable lot matrix combinations."
    >
      <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Selected attributes
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {props.selectedAttributeIds.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Possible combinations
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">
            {props.possibleCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
            Rows ready
          </p>
          <div className="mt-2 space-y-2">
            <p className="text-2xl font-semibold text-zinc-950">
              {props.readyRows}
            </p>
            <StatusBadge label={tableStatusLabel} variant={tableStatusVariant} />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
              Preview
            </p>
            <span className="text-xs text-zinc-500">{rowsInTable} rows in table</span>
          </div>
          {preview.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Select one or more attributes to preview the matrix combinations.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {preview.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
