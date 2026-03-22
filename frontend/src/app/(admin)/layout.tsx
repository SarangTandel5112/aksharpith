// src/app/(admin)/layout.tsx
// Phase 2 will add: Sidebar nav, header, auth guard, session display
type AdminLayoutProps = { children: React.ReactNode }

export default function AdminLayout(props: AdminLayoutProps): React.JSX.Element {
  return <>{props.children}</>
}
