"use client";

import { buildVariantWorkspaceRows, formatProductType } from "@features/admin/products/services/product-admin.helpers";
import {
  DataTable,
  PageHeader,
  StatusBadge,
  TableToolbar,
} from "@shared/components/admin";
import type { Column } from "@shared/components/admin/DataTable";
import { Button } from "@shared/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type React from "react";
import { useDeferredValue, useMemo, useState } from "react";
import type { DirectVariantWorkspaceRow } from "../types/variants.types";

const COLUMNS: Column<DirectVariantWorkspaceRow>[] = [
  {
    key: "productName",
    label: "Product",
    sortable: true,
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-zinc-950">{row.productName}</p>
        <p className="text-xs text-zinc-500">{row.productCode}</p>
      </div>
    ),
  },
  {
    key: "productType",
    label: "Type",
    render: (row) => (
      <StatusBadge label={formatProductType(row.productType)} variant="info" />
    ),
  },
  {
    key: "variantCount",
    label: "Lot Matrix",
    render: (row) => (
      <div className="space-y-1 text-sm text-zinc-700">
        <p>{row.variantCount} total</p>
        <p>{row.activeVariantCount} active</p>
      </div>
    ),
  },
];

export function VariantsIndexModule(): React.JSX.Element {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [typeFilter, setTypeFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");

  const rows = useMemo(() => buildVariantWorkspaceRows(), []);
  const filteredRows = useMemo(() => {
    const query = deferredSearch.toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !deferredSearch.trim()
        ? true
        : [row.productName, row.productCode, row.productType]
            .join(" ")
            .toLowerCase()
            .includes(query);
      const matchesType =
        typeFilter === "all" ? true : row.productType === typeFilter;
      const matchesCoverage =
        coverageFilter === "all"
          ? true
          : coverageFilter === "generated"
            ? row.variantCount > 0
            : row.variantCount === 0;

      return matchesSearch && matchesType && matchesCoverage;
    });
  }, [coverageFilter, deferredSearch, rows, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lot Matrix"
        subtitle="Open a product to generate and manage its lot matrix rows."
      />
      <div className="rounded-[1.25rem] border border-zinc-200 bg-white shadow-sm">
        <TableToolbar
          search={search}
          onSearch={setSearch}
          placeholder="Search products, SKU, or type…"
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
              id: "coverage",
              label: "Rows",
              value: coverageFilter,
              onChange: setCoverageFilter,
              options: [
                { label: "Generated", value: "generated" },
                { label: "Not Generated", value: "not-generated" },
              ],
            },
          ]}
          onClearFilters={() => {
            setSearch("");
            setTypeFilter("all");
            setCoverageFilter("all");
          }}
        />
        <div>
          <DataTable
            columns={COLUMNS}
            rows={filteredRows}
            renderActions={(row) => (
              <Button asChild variant="outline">
                <Link href={`/admin/products/${row.productId}/variants`}>
                  Open Lot Matrix
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
}
