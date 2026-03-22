"use client";

import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { queryKeys } from "@shared/lib/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  selectLotIsSubmitting,
  selectLotMatrix,
  selectLotSelectedAttrIds,
  selectLotStep,
  useLotMatrixStore,
} from "../stores/lot-matrix.store";

type LotMatrixWizardProps = { productId: string };

export function LotMatrixWizard(
  props: LotMatrixWizardProps,
): React.JSX.Element {
  const step = useLotMatrixStore(selectLotStep);
  const selectedAttrIds = useLotMatrixStore(selectLotSelectedAttrIds);
  const matrix = useLotMatrixStore(selectLotMatrix);
  const isSubmitting = useLotMatrixStore(selectLotIsSubmitting);
  const qc = useQueryClient();

  const { data: attrsData } = useQuery({
    queryKey: queryKeys.attributes.list(),
    queryFn: () => fetch("/api/attributes").then((r) => r.json()),
    staleTime: 5 * 60_000,
  });

  const attributes: Attribute[] = (attrsData?.data?.items ?? []) as Attribute[];

  const submitMutation = useMutation({
    mutationFn: (rows: typeof matrix) =>
      fetch(`/api/products/${props.productId}/lot-matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants: rows }),
      }).then((r) => r.json()),
    onMutate: () => {
      useLotMatrixStore.getState().setIsSubmitting(true);
    },
    onSettled: () => {
      useLotMatrixStore.getState().setIsSubmitting(false);
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.variants.all(props.productId),
      });
      useLotMatrixStore.getState().reset();
    },
  });

  if (step === 1) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[var(--text-heading)]">
          Step 1: Select Attributes
        </h2>
        <div className="flex flex-col gap-2">
          {attributes.map((attr) => (
            <label
              key={attr.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedAttrIds.includes(attr.id)}
                onChange={() =>
                  useLotMatrixStore.getState().toggleAttribute(attr.id)
                }
              />
              <span>{attr.attributeName}</span>
              <span className="text-[var(--text-muted)]">
                ({attr.values.join(", ")})
              </span>
            </label>
          ))}
        </div>
        <div className="text-sm text-[var(--text-muted)]">
          {selectedAttrIds.length === 0
            ? "Select at least one attribute"
            : `Will generate ${selectedAttrIds.reduce(
                (acc, id) =>
                  acc *
                  (attributes.find((a) => a.id === id)?.values.length ?? 1),
                1,
              )} variants`}
        </div>
        <button
          type="button"
          disabled={selectedAttrIds.length === 0}
          onClick={() => {
            useLotMatrixStore.getState().generateMatrix(attributes);
            useLotMatrixStore.getState().setStep(2);
          }}
          className="self-start rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Next: Review Matrix →
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[var(--text-heading)]">
          Step 2: Review &amp; Edit Matrix
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--surface-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-subtle)] border-b border-[var(--surface-border)]">
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">
                  Combination
                </th>
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">
                  SKU
                </th>
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">
                  Price
                </th>
                <th className="text-left px-3 py-2 text-[var(--text-muted)]">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                // Safe: idx is stable — matrix built from cartesianProduct, not reordered
                <tr
                  key={idx}
                  className="border-b border-[var(--surface-border)] last:border-0"
                >
                  <td className="px-3 py-2 text-[var(--text-body)]">
                    {Object.entries(row.combination)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.sku}
                      onChange={(e) =>
                        useLotMatrixStore
                          .getState()
                          .updateMatrixRow(idx, "sku", e.target.value)
                      }
                      className="w-full border border-[var(--surface-border)] rounded px-2 py-1 text-[var(--text-body)] bg-[var(--surface-page)]"
                      placeholder="SKU-001"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) =>
                        useLotMatrixStore
                          .getState()
                          .updateMatrixRow(idx, "price", Number(e.target.value))
                      }
                      className="w-24 border border-[var(--surface-border)] rounded px-2 py-1 text-[var(--text-body)] bg-[var(--surface-page)]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.stock}
                      onChange={(e) =>
                        useLotMatrixStore
                          .getState()
                          .updateMatrixRow(idx, "stock", Number(e.target.value))
                      }
                      className="w-24 border border-[var(--surface-border)] rounded px-2 py-1 text-[var(--text-body)] bg-[var(--surface-page)]"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => useLotMatrixStore.getState().setStep(1)}
            className="px-4 py-2 text-sm rounded border border-[var(--surface-border)] text-[var(--text-body)]"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => useLotMatrixStore.getState().setStep(3)}
            className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white"
          >
            Next: Confirm →
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Confirm
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[var(--text-heading)]">
        Step 3: Confirm &amp; Generate
      </h2>
      <p className="text-sm text-[var(--text-muted)]">
        This will create {matrix.length} variants for this product. Existing
        variants with the same SKU will be skipped.
      </p>
      {submitMutation.isError && (
        <p className="text-sm text-[var(--color-danger)]">
          Failed to generate variants. Please try again.
        </p>
      )}
      {submitMutation.isSuccess && (
        <p className="text-sm text-[var(--color-success)]">
          Variants generated successfully!
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => useLotMatrixStore.getState().setStep(2)}
          className="px-4 py-2 text-sm rounded border border-[var(--surface-border)] text-[var(--text-body)]"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={isSubmitting || submitMutation.isPending}
          onClick={() => submitMutation.mutate(matrix)}
          className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white disabled:opacity-50"
        >
          {submitMutation.isPending ? "Generating…" : "Generate Variants"}
        </button>
      </div>
    </div>
  );
}
