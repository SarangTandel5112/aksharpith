// src/proxy.ts
import { getToken } from 'next-auth/jwt'
import { type NextRequest, NextResponse } from 'next/server'

export const TRACE_ID_HEADER = 'x-trace-id'
export const NONCE_HEADER    = 'x-nonce'

const PUBLIC_PATHS = [
  '/login',
  '/api/health',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/unauthorized',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (!isPublicPath(pathname)) {
    const token = await getToken({
      req:    request,
      secret: process.env.NEXTAUTH_SECRET ?? '',
    })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }

    const roleName = (token.role as { roleName: string } | undefined)?.roleName ?? ''

    // Admin-only routes
    if (pathname.startsWith('/admin/roles') || pathname.startsWith('/admin/users')) {
      if (roleName !== 'Admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Admin + Staff routes
    if (pathname.startsWith('/admin')) {
      if (roleName !== 'Admin' && roleName !== 'Staff') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  // Propagate or generate trace ID
  const traceId = request.headers.get(TRACE_ID_HEADER) ?? crypto.randomUUID()
  const nonce   = generateNonce()

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    `connect-src 'self' ${process.env.NEST_API ?? ''} https://app.posthog.com`,
    'font-src \'self\'',
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        [TRACE_ID_HEADER]: traceId,
        [NONCE_HEADER]:    nonce,
      }),
    },
  })

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(TRACE_ID_HEADER, traceId)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
