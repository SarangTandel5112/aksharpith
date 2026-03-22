// src/features/auth/hooks/useSession.ts
'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'
import type { SessionUser } from '@shared/types/core'

export type UseSessionResult =
  | { status: 'loading'; user: null;        accessToken: null }
  | { status: 'unauthenticated'; user: null; accessToken: null }
  | { status: 'authenticated'; user: SessionUser; accessToken: string }

export function useSession(): UseSessionResult {
  const { data, status } = useNextAuthSession()

  if (status === 'loading') {
    return { status: 'loading', user: null, accessToken: null }
  }

  if (status === 'unauthenticated' || data === null || data === undefined) {
    return { status: 'unauthenticated', user: null, accessToken: null }
  }

  return {
    status:      'authenticated',
    user:        data.user as SessionUser,
    accessToken: data.accessToken,
  }
}
