import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProductsList } from "./useProducts";

describe("useProductsList", () => {
  it("returns product list data from the local mock layer", () => {
    const { result } = renderHook(() => useProductsList({}));

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data?.data.items.length).toBeGreaterThan(0);
  });

  it("stays ready immediately in static mode", () => {
    const { result } = renderHook(() => useProductsList({}));
    expect(result.current.isLoading).toBe(false);
  });
});
