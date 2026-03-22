import { adminHandlers }   from './admin.handlers'
import { authHandlers }    from './auth.handlers'
import { catalogHandlers } from './catalog.handlers'

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...catalogHandlers,
]
