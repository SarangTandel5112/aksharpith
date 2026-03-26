"use client";

import { ProductsSummaryStrip } from "@features/admin/products/components/list/ProductsSummaryStrip";
import { SectionCard, PageHeader } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import type React from "react";
import { findProduct, getVariantsForProduct } from "@features/admin/products/services/product-admin.mock";
import { formatCurrency } from "@features/admin/products/services/product-admin.helpers";
import { LotMatrixWizard } from "./LotMatrixWizard";
import { PersistedVariantTable } from "./PersistedVariantTable";

type VariantWorkspaceProps = {
  productId: string;
};

export function VariantWorkspace(
  props: VariantWorkspaceProps,
): React.JSX.Element {
  const product = findProduct(Number(props.productId));

  if (!product) {
    return (
      <SectionCard
        title="Product Not Found"
        description="We couldn't find that product."
      >
        <Button asChild>
          <Link href="/admin/products">Return to products</Link>
        </Button>
      </SectionCard>
    );
  }

  const variants = getVariantsForProduct(product.id);

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/products/${product.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back to product
      </Link>
      <PageHeader
        title={`${product.name} Lot Matrix`}
        subtitle={`${product.code} • ${formatCurrency(product.price)} price`}
      />
      <ProductsSummaryStrip
        items={[
          {
            label: "Saved Rows",
            value: String(variants.length),
            tone: "info",
          },
          {
            label: "Active Rows",
            value: String(variants.filter((variant) => variant.isActive).length),
            tone: "success",
          },
          {
            label: "Deleted Rows",
            value: String(variants.filter((variant) => variant.isDeleted).length),
            tone: "neutral",
          },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <LotMatrixWizard productId={product.id} />
        <PersistedVariantTable variants={variants} />
      </div>
    </div>
  );
}
