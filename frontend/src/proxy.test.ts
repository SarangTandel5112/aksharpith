import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { NONCE_HEADER, proxy, TRACE_ID_HEADER } from "./proxy";

// Mock next-auth/jwt getToken for auth-dependent tests
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}))

import { getToken } from 'next-auth/jwt'
const mockGetToken = vi.mocked(getToken)

function makeRequest(
  path: string,
  headers?: Record<string, string>,
): NextRequest {
  const url = `http://localhost:3000${path}`;
  return new NextRequest(url, headers !== undefined ? { headers } : {});
}

describe("proxy", () => {
  it("generates x-trace-id on every request", async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest("/pos/checkout");
    const response = await proxy(req);
    expect(response.headers.get(TRACE_ID_HEADER)).toBeTruthy();
  });

  it("propagates existing x-trace-id from upstream", async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest("/pos/checkout", {
      [TRACE_ID_HEADER]: "upstream-trace-123",
    });
    const response = await proxy(req);
    expect(response.headers.get(TRACE_ID_HEADER)).toBe("upstream-trace-123");
  });

  it("sets Content-Security-Policy header", async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest("/pos/checkout");
    const response = await proxy(req);
    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("nonce-");
  });

  it("sets X-Frame-Options to DENY", async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest("/pos/checkout");
    const response = await proxy(req);
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets X-Content-Type-Options to nosniff", async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest("/pos/checkout");
    const response = await proxy(req);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("generates a unique nonce per request", async () => {
    mockGetToken.mockResolvedValue({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req1 = makeRequest("/pos/checkout");
    const req2 = makeRequest("/pos/checkout");
    const res1 = await proxy(req1);
    const res2 = await proxy(req2);
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

describe('proxy — auth guard', () => {
  it('redirects unauthenticated user to /login for protected route', async () => {
    mockGetToken.mockResolvedValueOnce(null)
    const req = makeRequest('/products')
    const response = await proxy(req)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('allows authenticated user through to /products', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest('/products')
    const response = await proxy(req)
    expect(response.status).not.toBe(307)
  })

  it('redirects non-Admin/Staff to /unauthorized for /admin routes', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Viewer' }, accessToken: 'tok',
    } as never)
    const req = makeRequest('/admin/products')
    const response = await proxy(req)
    expect(response.headers.get('location')).toContain('/unauthorized')
  })

  it('allows Admin through to /admin routes', async () => {
    mockGetToken.mockResolvedValueOnce({
      id: 'u1', role: { roleName: 'Admin' }, accessToken: 'tok',
    } as never)
    const req = makeRequest('/admin/products')
    const response = await proxy(req)
    expect(response.status).not.toBe(307)
  })

  it('allows public /login path without auth', async () => {
    mockGetToken.mockResolvedValueOnce(null)
    const req = makeRequest('/login')
    const response = await proxy(req)
    expect(response.status).not.toBe(307)
  })
})
