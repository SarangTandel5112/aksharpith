// src/__tests__/msw/handlers/index.ts
import { adminHandlers } from './admin.handlers'
import { authHandlers }  from './auth.handlers'

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
]
