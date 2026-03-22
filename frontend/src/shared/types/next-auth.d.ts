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
      firstName: string
      lastName: string
      role: { id: string; roleName: string }
    }
  }
}

declare module 'next-auth/jwt' {
  // Required: TypeScript declaration merging requires interface keyword (see above)
  interface JWT {
    accessToken: string
    id: string
    firstName: string
    lastName: string
    role: { id: string; roleName: string }
  }
}
