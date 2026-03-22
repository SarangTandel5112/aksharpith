import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, beforeAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@test/msw/server'
import { useProductsList } from './useProducts'
import type { ReactNode } from 'react'

// BFF relative URL resolves to http://localhost:3000 in happy-dom
// MSW global handlers mock http://localhost:3001 (NestJS).
// Add BFF-level overrides so the hook's fetch('/api/products') is intercepted.
beforeAll(() => {
  server.use(
    http.get('http://localhost:3000/api/products', ({ request }) => {
      const url   = new URL(request.url)
      const page  = Number(url.searchParams.get('page')  ?? 1)
      const limit = Number(url.searchParams.get('limit') ?? 12)
      return HttpResponse.json({
        statusCode: 200, message: 'OK',
        data: { items: [{ id: 'p1', name: 'Test Product' }], total: 1, page, limit, totalPages: 1 },
      })
    }),
  )
})

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper(props: { children: ReactNode }): React.JSX.Element {
    return <QueryClientProvider client={qc}>{props.children}</QueryClientProvider>
  }
}

describe('useProductsList', () => {
  it('returns product list data from BFF', async () => {
    const { result } = renderHook(
      () => useProductsList({}),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data?.items).toBeDefined()
    expect(Array.isArray(result.current.data?.data?.items)).toBe(true)
  })

  it('starts in loading state', () => {
    const { result } = renderHook(
      () => useProductsList({}),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })
})
