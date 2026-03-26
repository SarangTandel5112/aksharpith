import { beforeEach, describe, expect, it } from "vitest";
import { useCatalogFiltersStore } from "./catalog-filters.store";

beforeEach(() => useCatalogFiltersStore.getState().reset());

describe("catalog-filters.store", () => {
  it("setSearch updates search and resets page to 1", () => {
    useCatalogFiltersStore.getState().setPage(3);
    useCatalogFiltersStore.getState().setSearch("blue shirt");
    expect(useCatalogFiltersStore.getState().search).toBe("blue shirt");
    expect(useCatalogFiltersStore.getState().page).toBe(1);
  });

  it("setCategoryId updates categoryId", () => {
    useCatalogFiltersStore.getState().setCategoryId(101);
    expect(useCatalogFiltersStore.getState().categoryId).toBe(101);
    useCatalogFiltersStore.getState().setCategoryId(null);
    expect(useCatalogFiltersStore.getState().categoryId).toBeNull();
  });

  it("reset returns to initial state", () => {
    useCatalogFiltersStore.getState().setSearch("test");
    useCatalogFiltersStore.getState().setCategoryId(101);
    useCatalogFiltersStore.getState().reset();
    expect(useCatalogFiltersStore.getState().search).toBe("");
    expect(useCatalogFiltersStore.getState().categoryId).toBeNull();
    expect(useCatalogFiltersStore.getState().page).toBe(1);
  });
});
