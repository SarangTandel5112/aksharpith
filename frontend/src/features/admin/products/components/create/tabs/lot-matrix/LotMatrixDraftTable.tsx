"use client";

import { formatCurrency } from "@features/admin/products/services/product-admin.helpers";
import { summarizeLotMatrixRow } from "@features/admin/products/services/product-create.helpers";
import type {
  ProductLotMatrixAttributeDefinition,
  ProductLotMatrixRowDraft,
} from "@features/admin/products/types/product-create.types";
import { SectionCard, StatusBadge } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { cn } from "@shared/lib/utils";
import { IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useEffect, useRef } from "react";

type LotMatrixDraftTableProps = {
  matrixAttributes: ProductLotMatrixAttributeDefinition[];
  rows: ProductLotMatrixRowDraft[];
  possibleCount: number;
  selectedAttributeCount: number;
  highlightedRowId: string | null;
  productCode: string;
  price: number;
  onChangeSelection: (
    rowId: string,
    attributeId: string,
    attributeValueId: string | null,
  ) => void;
  onChangeField: (
    rowId: string,
    field: "sku" | "price" | "stockQuantity" | "isActive",
    value: string | number | boolean,
  ) => void;
  onRemoveRow: (rowId: string) => void;
};

const EMPTY_VALUE = "__none__";

export function LotMatrixDraftTable(
  props: LotMatrixDraftTableProps,
): React.JSX.Element {
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);
  const missingRows = Math.max(props.possibleCount - props.rows.length, 0);
  const hasBaseDefaults =
    props.productCode.trim().length > 0 || props.price > 0;

  useEffect(() => {
    if (props.highlightedRowId === null) return;

    highlightedRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [props.highlightedRowId]);

  return (
    <SectionCard title="Matrix Rows">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-zinc-900">
            {props.rows.length} rows
          </span>
          {missingRows > 0 ? (
            <span className="rounded-full bg-white px-3 py-1 text-sm text-zinc-600">
              {missingRows} pending
            </span>
          ) : null}
        </div>
        {hasBaseDefaults ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            {props.productCode.trim().length > 0 ? (
              <span className="rounded-full bg-white px-3 py-1">
                {props.productCode.trim()}
              </span>
            ) : null}
            {props.price > 0 ? (
              <span className="rounded-full bg-white px-3 py-1">
                {formatCurrency(props.price)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {props.rows.length > 0 &&
      props.selectedAttributeCount > 0 &&
      props.possibleCount > props.rows.length ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Generate again to fill the remaining {missingRows} row
          {missingRows === 1 ? "" : "s"}.
        </div>
      ) : null}
      {props.rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center text-sm text-zinc-500">
          No rows yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            <div className="overflow-x-auto bg-white">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-950 text-white">
                  <tr>
                    {props.matrixAttributes.map((attribute) => (
                      <th
                        key={attribute.id}
                        className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em]"
                      >
                        {attribute.name}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em]">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em]">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em]">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em]">
                      State
                    </th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.12em]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {props.rows.map((row) => (
                    <tr
                      key={row.id}
                      ref={
                        row.id === props.highlightedRowId
                          ? highlightedRowRef
                          : null
                      }
                      className={cn(
                        "align-top transition-colors hover:bg-zinc-50",
                        row.id === props.highlightedRowId
                          ? "bg-sky-50 ring-1 ring-inset ring-sky-200"
                          : "bg-white",
                      )}
                    >
                      {props.matrixAttributes.map((attribute) => {
                        const selection = row.selections.find(
                          (item) => item.attributeId === attribute.id,
                        );

                        return (
                          <td
                            key={`${row.id}-${attribute.id}`}
                            className="px-4 py-4"
                          >
                            <Select
                              value={
                                selection?.attributeValueId !== null &&
                                selection?.attributeValueId !== undefined
                                  ? String(selection.attributeValueId)
                                  : EMPTY_VALUE
                              }
                              onValueChange={(value) =>
                                props.onChangeSelection(
                                  row.id,
                                  attribute.id,
                                  value === EMPTY_VALUE ? null : value,
                                )
                              }
                            >
                              <SelectTrigger className="min-w-28 bg-white">
                                <SelectValue
                                  placeholder={`Select ${attribute.name}`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={EMPTY_VALUE}>
                                  Select value
                                </SelectItem>
                                {attribute.values.map((value) => (
                                  <SelectItem key={value.id} value={String(value.id)}>
                                    {value.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        );
                      })}
                      <td className="px-4 py-4">
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          className="min-w-24"
                          value={row.stockQuantity}
                          onChange={(event) =>
                            props.onChangeField(
                              row.id,
                              "stockQuantity",
                              Number(event.target.value),
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="min-w-28"
                          value={row.price}
                          onChange={(event) =>
                            props.onChangeField(
                              row.id,
                              "price",
                              Number(event.target.value),
                            )
                          }
                        />
                      </td>
                      <td className="min-w-[220px] px-4 py-4">
                        <Input
                          value={row.sku}
                          placeholder="SKU"
                          onChange={(event) =>
                            props.onChangeField(
                              row.id,
                              "sku",
                              event.target.value,
                            )
                          }
                        />
                        <p className="mt-2 max-w-52 text-xs text-zinc-500">
                          {summarizeLotMatrixRow(row)}
                        </p>
                      </td>
                      <td className="min-w-[180px] px-4 py-4">
                        <div className="space-y-2">
                          <StatusBadge
                            label={
                              row.source === "generated"
                                ? "Generated"
                                : "Manual"
                            }
                            variant={
                              row.source === "generated" ? "info" : "neutral"
                            }
                          />
                          <div className="flex h-9 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3">
                            <Checkbox
                              checked={row.isActive}
                              aria-label={`Set ${row.sku || "row"} active`}
                              onCheckedChange={(checked) =>
                                props.onChangeField(
                                  row.id,
                                  "isActive",
                                  Boolean(checked),
                                )
                              }
                            />
                            <span className="text-sm text-zinc-700">
                              {row.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove lot matrix row"
                          onClick={() => props.onRemoveRow(row.id)}
                        >
                          <IconTrash className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
