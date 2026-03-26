"use client";

import { buildProductGridCardModel } from "@features/admin/products/services/product-create.helpers";
import type { ProductListRow } from "@features/admin/products/types/products.types";
import { StatusBadge } from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { cn } from "@shared/lib/utils";
import {
  IconDots,
  IconExternalLink,
  IconShoppingBag,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import {
  formatProductListingStatus,
  formatProductSellingStatus,
} from "../../services/product-admin.helpers";

type ProductsGridViewProps = {
  rows: ProductListRow[];
  onDelete?: (row: ProductListRow) => void;
};

export function ProductsGridView(
  props: ProductsGridViewProps,
): React.JSX.Element {
  const router = useRouter();
  const productTypePreviewClasses = {
    Standard: "from-slate-100 via-white to-zinc-100 text-zinc-900",
    "Lot Matrix": "from-sky-100 via-cyan-50 to-white text-sky-950",
    Digital: "from-emerald-100 via-teal-50 to-white text-emerald-950",
    Service: "from-amber-100 via-orange-50 to-white text-amber-950",
  } as const;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {props.rows.map((row) => {
        const card = buildProductGridCardModel(row);
        const productInitials = card.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase();

        return (
          <article
            key={row.product.id}
            className="flex h-full flex-col rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 shrink-0 items-end rounded-[1.25rem] bg-gradient-to-br p-3 shadow-inner",
                    productTypePreviewClasses[card.productType],
                  )}
                >
                  <span className="text-lg font-semibold tracking-[0.08em]">
                    {productInitials}
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={card.productType}
                      variant="info"
                    />
                    <StatusBadge
                      label={formatProductListingStatus(card.isActive)}
                      variant={card.isActive ? "success" : "neutral"}
                    />
                    <StatusBadge
                      label={formatProductSellingStatus(card.itemInactive)}
                      variant={card.itemInactive ? "warning" : "neutral"}
                    />
                  </div>
                  <div>
                    <p className="truncate text-lg font-semibold text-zinc-950">
                      {card.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{card.code}</p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Product actions"
                  >
                    <IconDots className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/admin/products/${row.product.id}`)
                    }
                  >
                    Open Product
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/admin/products/${row.product.id}/variants`)
                    }
                  >
                    Open Lot Matrix
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => props.onDelete?.(row)}
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-500">Department</span>
                <span className="font-medium text-zinc-900">
                  {card.departmentName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-500">Category</span>
                <span className="font-medium text-zinc-900">
                  {card.categoryName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-500">Sub-category</span>
                <span className="font-medium text-zinc-900">
                  {card.subCategoryName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-zinc-500">Group</span>
                <span className="font-medium text-zinc-900">
                  {card.groupName}
                </span>
              </div>
            </div>

            {card.description ? (
              <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-500">
                {card.description}
              </p>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                No description added yet.
              </p>
            )}

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                  Price
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-900">
                  {card.priceLabel}
                </dd>
              </div>
              <div className="rounded-2xl bg-zinc-50 px-4 py-3">
                <dt className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                  Stock
                </dt>
                <dd className="mt-1 text-sm font-semibold text-zinc-900">
                  {card.stockLabel}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                Catalog Setup
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {card.setupMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl bg-white px-3 py-3 text-center"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">
                      {metric.label}
                    </p>
                    <div className="mt-2 flex justify-center">
                      <StatusBadge label={metric.value} variant={metric.tone} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <Button asChild size="sm">
                <Link href={`/admin/products/${row.product.id}`}>
                  <IconExternalLink className="h-4 w-4" />
                  Open Product
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/products/${row.product.id}/variants`}>
                  <IconShoppingBag className="h-4 w-4" />
                  Lot Matrix
                </Link>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
