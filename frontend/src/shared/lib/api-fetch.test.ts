// src/shared/lib/api-fetch.test.ts
import { server } from '@test/msw/server'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiFetch, parseApiError } from './api-fetch'

const BASE = 'http://localhost:3001'
const ACCESS_TOKEN = 'test-jwt-token'

describe('apiFetch', () => {
  it('sends Cookie header with access_token', async () => {
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers)
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN })

    expect(capturedHeaders['cookie']).toBe(`access_token=${ACCESS_TOKEN}`)
  })

  it('does NOT send tenant headers (no X-Organization-ID)', async () => {
    let capturedHeaders: Record<string, string> = {}

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers)
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN })

    expect(capturedHeaders['x-organization-id']).toBeUndefined()
    expect(capturedHeaders['x-store-id']).toBeUndefined()
    expect(capturedHeaders['x-terminal-id']).toBeUndefined()
  })

  it('always sends x-trace-id header', async () => {
    let capturedTraceId = ''

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedTraceId = request.headers.get('x-trace-id') ?? ''
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN })
    expect(capturedTraceId).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('uses provided traceId when given', async () => {
    let capturedTraceId = ''

    server.use(
      http.get(`${BASE}/api/test`, ({ request }) => {
        capturedTraceId = request.headers.get('x-trace-id') ?? ''
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', { accessToken: ACCESS_TOKEN, traceId: 'my-trace-123' })
    expect(capturedTraceId).toBe('my-trace-123')
  })

  it('forwards POST body', async () => {
    let capturedBody: unknown = null

    server.use(
      http.post(`${BASE}/api/test`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ ok: true })
      }),
    )

    await apiFetch('/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
      accessToken: ACCESS_TOKEN,
    })

    expect(capturedBody).toEqual({ name: 'test' })
  })
})

describe('parseApiError', () => {
  it('parses structured error response', async () => {
    const response = new Response(
      JSON.stringify({ code: 'NOT_FOUND', message: 'Resource not found' }),
      { status: 404 },
    )
    const error = await parseApiError(response)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.status).toBe(404)
  })

  it('handles unparseable response gracefully', async () => {
    const response = new Response('not json', { status: 500 })
    const error = await parseApiError(response)
    expect(error.code).toBe('PARSE_ERROR')
    expect(error.status).toBe(500)
  })
})
