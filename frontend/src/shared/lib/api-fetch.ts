// src/shared/lib/api-fetch.ts
import { env } from '@config/env'

export const TRACE_ID_HEADER = 'x-trace-id'

export type ApiFetchOptions = {
  method?:      'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?:        string
  headers?:     Record<string, string>
  accessToken:  string
  traceId?:     string
}

export type ApiFetchError = {
  code:     string
  message:  string
  status:   number
  errors?:  Record<string, string[]>
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions,
): Promise<Response> {
  const traceId = options.traceId ?? crypto.randomUUID()

  return fetch(`${env.NEST_API}${path}`, {
    method: options.method ?? 'GET',
    ...(options.body !== undefined ? { body: options.body } : {}),
    headers: {
      'Content-Type':    'application/json',
      'Cookie':          `access_token=${options.accessToken}`,
      [TRACE_ID_HEADER]: traceId,
      ...options.headers,
    },
  })
}

export async function parseApiError(response: Response): Promise<ApiFetchError> {
  try {
    const body = await response.json()
    return {
      code:    body.code    ?? 'UNKNOWN_ERROR',
      message: body.message ?? 'An unexpected error occurred',
      status:  response.status,
      errors:  body.errors,
    }
  } catch {
    return {
      code:    'PARSE_ERROR',
      message: 'Could not parse error response',
      status:  response.status,
    }
  }
}
