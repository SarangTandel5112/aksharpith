// @vitest-environment happy-dom
// Singleton behaviour requires window to be defined
import { beforeEach, describe, expect, it } from "vitest";
import { getQueryClient, makeQueryClient } from "./query-client";

// Reset the module-level browserClient between tests
beforeEach(async () => {
  // Reimport the module to reset the browserClient singleton
  vi.resetModules();
});

describe("makeQueryClient", () => {
  it("creates a query client with correct defaults", () => {
    const client = makeQueryClient();
    const options = client.getDefaultOptions();
    expect(options.queries?.staleTime).toBe(60_000);
    expect(options.queries?.retry).toBe(1);
    expect(options.queries?.refetchOnWindowFocus).toBe(false);
    expect(options.mutations?.retry).toBe(0);
  });
});

describe("getQueryClient", () => {
  it("returns a QueryClient instance", () => {
    const client = getQueryClient();
    expect(client).toBeDefined();
    expect(typeof client.getQueryCache).toBe("function");
  });

  it("returns the same instance on repeated calls in browser", async () => {
    // Re-import after module reset to get a fresh singleton state
    const { getQueryClient: freshGet } = await import("./query-client");
    const c1 = freshGet();
    const c2 = freshGet();
    expect(c1).toBe(c2);
  });
});
