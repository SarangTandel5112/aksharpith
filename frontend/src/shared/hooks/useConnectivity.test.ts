import { server } from "@test/msw/server";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { useConnectivity } from "./useConnectivity";

// Install testing library for React hooks
// npm install -D @testing-library/react @testing-library/dom

describe("useConnectivity", () => {
  beforeEach(() => {
    server.use(
      http.head("/api/health", () => new Response(null, { status: 200 })),
    );
  });

  it("starts as online and probes immediately", async () => {
    const { result } = renderHook(() => useConnectivity());

    await waitFor(() => {
      expect(result.current.lastCheckedAt).not.toBeNull();
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("goes offline when health probe fails", async () => {
    server.use(http.head("/api/health", () => HttpResponse.error()));

    const { result } = renderHook(() => useConnectivity());

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false);
    });
  });
});
