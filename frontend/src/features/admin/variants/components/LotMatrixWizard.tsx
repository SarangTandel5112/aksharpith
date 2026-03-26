"use client";

import { MOCK_ATTRIBUTES } from "@features/admin/products/services/product-admin.mock";
import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  selectLotIsSubmitting,
  selectLotSelectedAttributeIds,
  useLotMatrixStore,
} from "../stores/lot-matrix.store";
import { AttributePicker } from "./wizard/AttributePicker";
import { GenerationActionBar } from "./wizard/GenerationActionBar";

type LotMatrixWizardProps = {
  productId: number;
};

export function LotMatrixWizard(
  props: LotMatrixWizardProps,
): React.JSX.Element {
  const selectedAttributeIds = useLotMatrixStore(selectLotSelectedAttributeIds);
  const isSubmitting = useLotMatrixStore(selectLotIsSubmitting);
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const selectedAttributes = useMemo(
    () =>
      MOCK_ATTRIBUTES.filter((attribute) =>
        selectedAttributeIds.includes(attribute.id),
      ),
    [selectedAttributeIds],
  );

  const generatedCount = useMemo(() => {
    if (selectedAttributes.length === 0) return 0;

    return selectedAttributes.reduce(
      (total, attribute) => total * Math.max(attribute.values.length, 1),
      1,
    );
  }, [selectedAttributes]);

  useEffect(() => {
    if (selectedAttributeIds.length === 0) {
      setStatus("idle");
    }
  }, [selectedAttributeIds]);

  function handleGenerate(): void {
    useLotMatrixStore.getState().setIsSubmitting(true);

    window.setTimeout(() => {
      useLotMatrixStore.getState().setIsSubmitting(false);
      setStatus("success");
      console.log("Generate variant matrix", {
        productId: props.productId,
        attributeIds: selectedAttributeIds,
      });
    }, 260);
  }

  return (
    <div className="space-y-6">
      <AttributePicker
        attributes={MOCK_ATTRIBUTES}
        selectedAttributeIds={selectedAttributeIds}
        onToggle={(attributeId) =>
          useLotMatrixStore.getState().toggleAttribute(attributeId)
        }
      />
      <GenerationActionBar
        selectedCount={selectedAttributeIds.length}
        generatedCount={generatedCount}
        isSubmitting={isSubmitting}
        status={status}
        onGenerate={handleGenerate}
        onReset={() => useLotMatrixStore.getState().reset()}
      />
    </div>
  );
}
