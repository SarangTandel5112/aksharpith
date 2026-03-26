"use client";

import { getCatalogCategory } from "@features/catalog/services/catalog.mock";
import { plainTextFromRichText } from "@shared/lib/rich-text";
import Link from "next/link";
import type { CatalogProduct } from "../types/catalog.types";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard(props: ProductCardProps): React.JSX.Element {
  const category = getCatalogCategory(props.product);

  return (
    <Link
      href={`/products/${props.product.id}`}
      className="group relative block rounded-xl border border-[var(--surface-border)] bg-[var(--surface-subtle)] p-5 hover:border-[var(--primary-500)] hover:bg-[var(--bg-dark-2)] transition-all"
    >
      <span className="inline-flex rounded-full bg-[var(--primary-alpha-1)] px-2 py-0.5 text-xs font-medium text-[var(--primary-500)] mb-3">
        {category?.name ?? "—"}
      </span>

      <h3 className="font-semibold text-sm text-[var(--text-heading)] mb-1 line-clamp-2 group-hover:text-[var(--primary-400)]">
        {props.product.name}
      </h3>

      <p className="text-xs text-[var(--text-muted)] mb-3">
        {props.product.code}
      </p>

      <p className="text-xs text-[var(--text-body)] line-clamp-2 mb-4">
        {plainTextFromRichText(props.product.description)}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[var(--primary-400)]">
          ₹{props.product.price.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {props.product.department?.name ?? "—"}
        </span>
      </div>
    </Link>
  );
}
