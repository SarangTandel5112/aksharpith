import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CatalogProduct } from "../types/catalog.types";
import { ProductGrid } from "./ProductGrid";

const products: CatalogProduct[] = [
  {
    id: 1,
    code: "BS-001",
    upc: "8901234567890",
    name: "Blue Shirt",
    type: "Standard",
    description: "Nice shirt",
    model: null,
    departmentId: 1,
    subCategoryId: 0,
    groupId: null,
    hsnCode: "6109",
    price: 29.99,
    stockQuantity: 8,
    nonTaxable: false,
    itemInactive: false,
    nonStockItem: false,
    department: { id: 1, name: "Retail" },
    subCategory: null,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

describe("ProductGrid", () => {
  it("renders product cards when products are provided", () => {
    render(<ProductGrid products={products} isLoading={false} />);
    expect(screen.getByText("Blue Shirt")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", () => {
    render(<ProductGrid products={[]} isLoading />);
    expect(screen.getByTestId("product-grid-skeleton")).toBeInTheDocument();
  });

  it("shows empty state when no products", () => {
    render(<ProductGrid products={[]} isLoading={false} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});
