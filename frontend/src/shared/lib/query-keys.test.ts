// src/shared/lib/query-keys.test.ts
import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys";

describe("queryKeys", () => {
  describe("products", () => {
    it('all() returns ["products"]', () => {
      expect(queryKeys.products.all()).toEqual(["products"]);
    });
    it("list() includes filters", () => {
      const key = queryKeys.products.list({ page: 1 });
      expect(key[0]).toBe("products");
      expect(key).toContain("list");
    });
    it("detail() includes id", () => {
      const key = queryKeys.products.detail("prod-1");
      expect(key).toContain("prod-1");
    });
  });

  describe("categories", () => {
    it('all() returns ["categories"]', () => {
      expect(queryKeys.categories.all()).toEqual(["categories"]);
    });
  });

  describe("roles", () => {
    it('all() returns ["roles"]', () => {
      expect(queryKeys.roles.all()).toEqual(["roles"]);
    });
  });

  describe("variants", () => {
    it('all() includes productId and "variants"', () => {
      const key = queryKeys.variants.all("prod-1");
      expect(key).toContain("prod-1");
      expect(key).toContain("variants");
    });
    it("detail() includes both productId and variantId", () => {
      const key = queryKeys.variants.detail("prod-1", "var-1");
      expect(key).toContain("prod-1");
      expect(key).toContain("var-1");
    });
  });
});
