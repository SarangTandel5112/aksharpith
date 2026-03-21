import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { NONCE_HEADER, proxy, TRACE_ID_HEADER } from "./proxy";

function makeRequest(
  path: string,
  headers?: Record<string, string>,
): NextRequest {
  const url = `http://localhost:3000${path}`;
  return new NextRequest(url, headers !== undefined ? { headers } : {});
}

describe("proxy", () => {
  it("generates x-trace-id on every request", () => {
    const req = makeRequest("/pos/checkout");
    const response = proxy(req);
    expect(response.headers.get(TRACE_ID_HEADER)).toBeTruthy();
  });

  it("propagates existing x-trace-id from upstream", () => {
    const req = makeRequest("/pos/checkout", {
      [TRACE_ID_HEADER]: "upstream-trace-123",
    });
    const response = proxy(req);
    expect(response.headers.get(TRACE_ID_HEADER)).toBe("upstream-trace-123");
  });

  it("sets Content-Security-Policy header", () => {
    const req = makeRequest("/pos/checkout");
    const response = proxy(req);
    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("nonce-");
  });

  it("sets X-Frame-Options to DENY", () => {
    const req = makeRequest("/pos/checkout");
    const response = proxy(req);
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets X-Content-Type-Options to nosniff", () => {
    const req = makeRequest("/pos/checkout");
    const response = proxy(req);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("generates a unique nonce per request", () => {
    const req1 = makeRequest("/pos/checkout");
    const req2 = makeRequest("/pos/checkout");
    const res1 = proxy(req1);
    const res2 = proxy(req2);
    const csp1 = res1.headers.get("Content-Security-Policy") ?? "";
    const csp2 = res2.headers.get("Content-Security-Policy") ?? "";
    // Extract nonce values
    const nonce1 = csp1.match(/nonce-([^']+)/)?.[1];
    const nonce2 = csp2.match(/nonce-([^']+)/)?.[1];
    expect(nonce1).toBeTruthy();
    expect(nonce2).toBeTruthy();
    expect(nonce1).not.toBe(nonce2);
  });
});

// Suppress unused import warning — NONCE_HEADER is exported from proxy
// and consumed by layout.tsx in Phase 4
void NONCE_HEADER;
