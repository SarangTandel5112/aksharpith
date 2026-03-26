"use client";

import type { Attribute } from "@features/admin/attributes/types/attributes.types";
import { LotMatrixAttributeBuilder } from "@features/admin/products/components/create/tabs/lot-matrix/LotMatrixAttributeBuilder";
import { LotMatrixAttributeSelector } from "@features/admin/products/components/create/tabs/lot-matrix/LotMatrixAttributeSelector";
import { LotMatrixDraftTable } from "@features/admin/products/components/create/tabs/lot-matrix/LotMatrixDraftTable";
import {
  computeLotMatrixCount,
  getSelectedLotMatrixAttributes,
} from "@features/admin/products/services/product-create.helpers";
import type { Product } from "@features/admin/products/types/products.types";
import type {
  ProductLotMatrixAttributeBuilderInput,
  ProductLotMatrixRowDraft,
} from "@features/admin/products/types/product-create.types";
import { SectionCard } from "@shared/components/admin";
import type React from "react";

type ProductLotMatrixTabProps = {
  attributes: Attribute[];
  productType: Product["type"];
  productCode: string;
  price: number;
  selectedAttributeIds: number[];
  rows: ProductLotMatrixRowDraft[];
  highlightedRowId: string | null;
  onToggleAttribute: (id: number) => void;
  onCreateAttribute: (input: ProductLotMatrixAttributeBuilderInput) => void;
  onGenerateRows: () => void;
  onAddRow: () => void;
  onResetRows: () => void;
  onRemoveRow: (rowId: string) => void;
  onChangeSelection: (
    rowId: string,
    attributeId: number,
    attributeValueId: number | null,
  ) => void;
  onChangeField: (
    rowId: string,
    field: "sku" | "price" | "stockQuantity" | "isActive",
    value: string | number | boolean,
  ) => void;
};

export function ProductLotMatrixTab(
  props: ProductLotMatrixTabProps,
): React.JSX.Element {
  if (props.productType !== "Lot Matrix") {
    return (
      <SectionCard
        title="Lot Matrix"
        description="Choose the attributes used to create lot matrix rows for this product."
      >
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-5">
          <p className="text-sm font-medium text-zinc-900">
            Lot matrix is available for variable products.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Switch the product type to Variable in Basic Info when this product
            needs sellable combinations like size, color, or storage.
          </p>
        </div>
      </SectionCard>
    );
  }

  const possibleCount = computeLotMatrixCount(
    props.attributes,
    props.selectedAttributeIds,
  );
  const matrixAttributes = getSelectedLotMatrixAttributes(
    props.attributes,
    props.selectedAttributeIds,
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <LotMatrixAttributeSelector
            attributes={props.attributes}
            selectedAttributeIds={props.selectedAttributeIds}
            canGenerate={props.selectedAttributeIds.length > 0}
            canAddRow
            possibleCount={possibleCount}
            onToggleAttribute={props.onToggleAttribute}
            onGenerateRows={props.onGenerateRows}
            onAddRow={props.onAddRow}
            onResetRows={props.onResetRows}
          />
          <LotMatrixAttributeBuilder
            onCreateAttribute={props.onCreateAttribute}
          />
        </div>
        <LotMatrixDraftTable
          matrixAttributes={matrixAttributes}
          rows={props.rows}
          possibleCount={possibleCount}
          selectedAttributeCount={props.selectedAttributeIds.length}
          highlightedRowId={props.highlightedRowId}
          productCode={props.productCode}
          price={props.price}
          onChangeSelection={props.onChangeSelection}
          onChangeField={props.onChangeField}
          onRemoveRow={props.onRemoveRow}
        />
      </div>
    </div>
  );
}
