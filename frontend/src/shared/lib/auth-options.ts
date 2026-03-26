// src/shared/lib/auth-options.ts
import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { SessionUser } from '@shared/types/core'

const NEST_API = process.env.NEST_API ?? 'http://localhost:3001'

type BackendSessionUser = Omit<SessionUser, 'id'> & { id: number }

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        try {
          // Step 1: Login — extract access_token from Set-Cookie header
          const loginRes = await fetch(`${NEST_API}/api/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })

          if (!loginRes.ok) return null

          const setCookie = loginRes.headers.get('set-cookie')
          const token     = setCookie?.match(/access_token=([^;]+)/)?.[1]
          if (!token) return null

          // Step 2: Get user details with the extracted token
          const meRes = await fetch(`${NEST_API}/api/users/me`, {
            headers: { Cookie: `access_token=${token}` },
          })

          if (!meRes.ok) return null

          const meBody  = await meRes.json() as { data: BackendSessionUser }
          const user    = meBody.data

          return {
            id:          String(user.id),
            email:       user.email,
            username:    user.username,
            firstName:   user.firstName,
            middleName:  user.middleName,
            lastName:    user.lastName,
            roleId:      user.roleId,
            role:        user.role,
            accessToken: token,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is returned from authorize()
      if (user) {
        const u = user as {
          id: string
          email: string
          username: string
          firstName: string
          middleName: string | null
          lastName: string
          roleId: number
          role: { id: number; name: string; isActive: boolean } | null
          accessToken: string
        }
        token.id          = u.id
        token.email       = u.email
        token.username    = u.username
        token.firstName   = u.firstName
        token.middleName  = u.middleName
        token.lastName    = u.lastName
        token.roleId      = u.roleId
        token.role        = u.role
        token.accessToken = u.accessToken
      }
      return token
    },

    async session({ session, token }) {
      session.accessToken    = token.accessToken
      session.user.id        = token.id
      session.user.email     = token.email ?? ''
      session.user.username  = token.username
      session.user.firstName = token.firstName
      session.user.middleName = token.middleName
      session.user.lastName  = token.lastName
      session.user.roleId    = token.roleId
      session.user.role      = token.role
      return session
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: { strategy: 'jwt' },
}
