import { server } from "@test/msw/server";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { apiFetch, parseApiError } from "./api-fetch";

const ctx = {
  organizationId: "org_001",
  storeId: "store_001",
  terminalId: "term_001",
  userId: "user_001",
  accessToken: "test-token",
};

describe("apiFetch", () => {
  it("sends correct tenant headers", async () => {
    let capturedHeaders: Record<string, string> = {};

    server.use(
      http.get("http://localhost:8000/test/", ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers);
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiFetch("/test/", { ctx });

    expect(capturedHeaders["x-organization-id"]).toBe("org_001");
    expect(capturedHeaders["x-store-id"]).toBe("store_001");
    expect(capturedHeaders["x-terminal-id"]).toBe("term_001");
    expect(capturedHeaders["authorization"]).toBe("Bearer test-token");
  });

  it("always sends x-trace-id header", async () => {
    let capturedTraceId = "";

    server.use(
      http.get("http://localhost:8000/test/", ({ request }) => {
        capturedTraceId = request.headers.get("x-trace-id") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiFetch("/test/", { ctx });
    expect(capturedTraceId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("uses provided traceId when given", async () => {
    let capturedTraceId = "";

    server.use(
      http.get("http://localhost:8000/test/", ({ request }) => {
        capturedTraceId = request.headers.get("x-trace-id") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );

    await apiFetch("/test/", { ctx, traceId: "my-trace-123" });
    expect(capturedTraceId).toBe("my-trace-123");
  });
});

describe("parseApiError", () => {
  it("parses structured error response", async () => {
    const response = new Response(
      JSON.stringify({ code: "NOT_FOUND", message: "Order not found" }),
      { status: 404 },
    );
    const error = await parseApiError(response);
    expect(error.code).toBe("NOT_FOUND");
    expect(error.status).toBe(404);
  });

  it("handles unparseable response gracefully", async () => {
    const response = new Response("not json", { status: 500 });
    const error = await parseApiError(response);
    expect(error.code).toBe("PARSE_ERROR");
    expect(error.status).toBe(500);
  });
});
