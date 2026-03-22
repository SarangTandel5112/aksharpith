"use client";

import type { CatalogProduct } from "../types/catalog.types";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: CatalogProduct[];
  isLoading: boolean;
};

export function ProductGrid(props: ProductGridProps): React.JSX.Element {
  if (props.isLoading) {
    return (
      <div
        data-testid="product-grid-skeleton"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div
            key={key}
            className="h-52 rounded-xl bg-[var(--surface-subtle)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (props.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-[var(--text-heading)] mb-2">
          No products found
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {props.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
