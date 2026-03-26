// src/shared/types/next-auth.d.ts
import 'next-auth'

declare module 'next-auth' {
  // Required: TypeScript declaration merging requires the interface keyword for
  // module augmentation — this is a language-level constraint, not a style choice.
  // next-auth v4 declares Session/JWT as interfaces; you must use interface to
  // extend them. See: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  interface Session {
    accessToken: string
    user: {
      id: string
      email: string
      username: string
      firstName: string
      middleName: string | null
      lastName: string
      roleId: number
      role: { id: number; name: string; isActive: boolean } | null
    }
  }
}

declare module 'next-auth/jwt' {
  // Required: TypeScript declaration merging requires interface keyword (see above)
  interface JWT {
    accessToken: string
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    username: string
    roleId: number
    role: { id: number; name: string; isActive: boolean } | null
  }
}
