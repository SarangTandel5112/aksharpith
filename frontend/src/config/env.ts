// src/config/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL:    z.string().url(),
    NEST_API:        z.string().url(),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY:       z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN:        z.string().url().optional(),
    NEXT_PUBLIC_TERMINAL_ENV:      z.enum(['development', 'staging', 'production']),
    NEXT_PUBLIC_CHAOS_MODE:        z.enum(['true', 'false']).optional(),
    NEXT_PUBLIC_SENTRY_DISABLED:   z.enum(['true', 'false']).optional(),
  },
  runtimeEnv: {
    NEXTAUTH_SECRET:               process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL:                  process.env.NEXTAUTH_URL,
    NEST_API:                      process.env.NEST_API,
    NEXT_PUBLIC_POSTHOG_KEY:       process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SENTRY_DSN:        process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_TERMINAL_ENV:      process.env.NEXT_PUBLIC_TERMINAL_ENV,
    NEXT_PUBLIC_CHAOS_MODE:        process.env.NEXT_PUBLIC_CHAOS_MODE,
    NEXT_PUBLIC_SENTRY_DISABLED:   process.env.NEXT_PUBLIC_SENTRY_DISABLED,
  },
})
