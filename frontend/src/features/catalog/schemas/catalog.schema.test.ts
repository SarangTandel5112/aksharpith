import { describe, expect, it } from "vitest";
import { CatalogProductSchema } from "./catalog.schema";

describe("CatalogProductSchema", () => {
  it("accepts a valid product", () => {
    const result = CatalogProductSchema.safeParse({
      id: 1,
      code: "T-001",
      upc: "8901234567890",
      name: "Test",
      type: "Standard",
      description: "Desc",
      model: null,
      departmentId: 1,
      subCategoryId: 10,
      groupId: null,
      hsnCode: "8517",
      price: 99.99,
      stockQuantity: 5,
      nonTaxable: false,
      itemInactive: false,
      nonStockItem: false,
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = CatalogProductSchema.safeParse({
      id: 1,
      code: "T-001",
      upc: "8901234567890",
      type: "Standard",
      subCategory: null,
    });
    expect(result.success).toBe(false);
  });
});
