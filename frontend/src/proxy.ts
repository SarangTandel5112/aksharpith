import { type NextRequest, NextResponse } from "next/server";

export const TRACE_ID_HEADER = "x-trace-id";
export const NONCE_HEADER = "x-nonce";

// Routes that do not need auth checks
const PUBLIC_PATHS = [
  "/login",
  "/api/health",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  // Phase 4: enforce session auth — non-public routes will redirect to /login
  // when no valid session token is present
  if (!isPublicPath(pathname)) {
    // session guard goes here in Phase 4
  }

  // Propagate or generate trace ID
  const traceId = request.headers.get(TRACE_ID_HEADER) ?? crypto.randomUUID();
  const nonce = generateNonce();

  // Build CSP header
  // TODO Phase 4: tighten script-src once all inline scripts are audited
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    `connect-src 'self' ${process.env.DJANGO_API ?? ""} https://app.posthog.com`,
    "font-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        [TRACE_ID_HEADER]: traceId,
        [NONCE_HEADER]: nonce,
      }),
    },
  });

  // Security headers on every response
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(TRACE_ID_HEADER, traceId);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
