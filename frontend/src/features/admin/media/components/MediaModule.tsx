"use client";

import { useMockProductResource } from "@features/admin/products/hooks/useMockProductResource";
import {
  buildMediaWorkspaceRows,
  formatProductType,
} from "@features/admin/products/services/product-admin.helpers";
import type { ProductMediaWorkspaceRow } from "@features/admin/media/types/media.types";
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  TableToolbar,
} from "@shared/components/admin";
import { Button } from "@shared/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type React from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

export function MediaModule(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const rows = useMemo(() => buildMediaWorkspaceRows(), []);
  const filteredRows = useMemo(() => {
    const query = deferredSearch.toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !deferredSearch.trim()
        ? true
        : [row.product.name, row.product.code, row.product.type]
            .join(" ")
            .toLowerCase()
            .includes(query);
      const matchesType =
        typeFilter === "all" ? true : row.product.type === typeFilter;
        const matchesAsset =
          assetFilter === "all"
            ? true
            : assetFilter === "images"
              ? row.imageCount > 0
              : assetFilter === "videos"
                ? row.videoCount > 0
                : row.imageCount > 0 && row.videoCount > 0;

        return matchesSearch && matchesType && matchesAsset;
      },
    );
  }, [assetFilter, deferredSearch, rows, typeFilter]);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    rows[0]?.product.id ?? null,
  );

  useEffect(() => {
    if (!filteredRows.some((row) => row.product.id === selectedProductId)) {
      setSelectedProductId(filteredRows[0]?.product.id ?? null);
    }
  }, [filteredRows, selectedProductId]);

  const { data: selectedRow, isLoading } = useMockProductResource(
    selectedProductId,
    (productId) =>
      buildMediaWorkspaceRows().find((row) => row.product.id === productId) ?? null,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Media"
        subtitle="Review product images and videos from one place."
      />
      <div className="rounded-[1.25rem] border border-zinc-200 bg-white shadow-sm">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search products…"
          selectedCount={0}
          filters={[
            {
              id: "type",
              label: "Type",
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { label: "Standard", value: "Standard" },
                { label: "Lot Matrix", value: "Lot Matrix" },
              ],
            },
            {
              id: "asset",
              label: "Assets",
              value: assetFilter,
              onChange: setAssetFilter,
              options: [
                { label: "Images", value: "images" },
                { label: "Videos", value: "videos" },
                { label: "Mixed", value: "mixed" },
              ],
            },
          ]}
          onClearFilters={() => {
            setSearch("");
            setTypeFilter("all");
            setAssetFilter("all");
          }}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard
          title="Products"
          description="Select a product to review its media."
        >
          <div className="space-y-3">
            {filteredRows.map((row) => {
              const isSelected = row.product.id === selectedProductId;

              return (
                <button
                  key={row.product.id}
                  type="button"
                  onClick={() => setSelectedProductId(row.product.id)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                    isSelected
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{row.product.name}</p>
                      <p className={isSelected ? "text-zinc-200" : "text-zinc-500"}>
                        {row.product.code}
                      </p>
                    </div>
                    <StatusBadge
                      label={`${row.totalMedia} assets`}
                      variant={isSelected ? "info" : "neutral"}
                    />
                  </div>
                  <p className={`mt-3 text-sm ${isSelected ? "text-zinc-200" : "text-zinc-500"}`}>
                    {row.imageCount} images • {row.videoCount} videos •{" "}
                    {formatProductType(row.product.type)}
                  </p>
                </button>
              );
            })}
          </div>
        </SectionCard>
        {isLoading ? (
          <SectionCard
            title="Loading Media"
            description="Loading media for the selected product."
          >
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-10 text-sm text-zinc-500">
              Loading media assets…
            </div>
          </SectionCard>
        ) : selectedRow ? (
          <SectionCard
            title={selectedRow.product.name}
            description="Primary media appears first, followed by the rest of the gallery."
          >
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label={`${selectedRow.totalMedia} total`} variant="info" />
              <StatusBadge label={`${selectedRow.imageCount} images`} variant="neutral" />
              <StatusBadge label={`${selectedRow.videoCount} videos`} variant="neutral" />
              <Button asChild variant="outline">
                <Link href={`/admin/products/${selectedRow.product.id}`}>
                  Open Product
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            {selectedRow.primaryMedia ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                  Primary Asset
                </p>
                <p className="mt-2 text-sm font-medium text-zinc-900">
                  {selectedRow.primaryMedia.url}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedRow.primaryMedia.type} • sort order{" "}
                  {selectedRow.primaryMedia.sortOrder}
                </p>
              </div>
            ) : null}
            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    {["Asset URL", "Type", "Primary", "Sort Order"].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.14em] text-zinc-400"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {selectedRow.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm text-zinc-700">{item.url}</td>
                      <td className="px-4 py-4 text-sm text-zinc-700">{item.type}</td>
                      <td className="px-4 py-4 text-sm text-zinc-700">
                        {item.isPrimary ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-700">{item.sortOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="No Product Selected"
            description="Choose a product to review its media."
          >
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-10 text-sm text-zinc-500">
              Nothing selected yet.
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
