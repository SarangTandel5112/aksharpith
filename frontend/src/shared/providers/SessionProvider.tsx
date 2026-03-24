// src/shared/providers/SessionProvider.tsx
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

type SessionProviderProps = {
  children: React.ReactNode
}

export function SessionProvider(props: SessionProviderProps): React.JSX.Element {
  return <NextAuthSessionProvider>{props.children}</NextAuthSessionProvider>
}
