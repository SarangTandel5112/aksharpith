// src/middleware.ts
// Re-export the proxy function as Next.js middleware.
// Logic lives in proxy.ts so it can be unit-tested independently.
export { proxy as middleware, config } from './proxy'
