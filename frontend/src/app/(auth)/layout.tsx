// src/app/(auth)/layout.tsx
type AuthLayoutProps = { children: React.ReactNode }

export default function AuthLayout(props: AuthLayoutProps): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-dark)]">
      {props.children}
    </main>
  )
}
