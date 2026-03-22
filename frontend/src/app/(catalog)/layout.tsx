// src/app/(catalog)/layout.tsx
// Phase 3 will add: FloatingNav, ThemeToggle, auth guard
type CatalogLayoutProps = { children: React.ReactNode }

export default function CatalogLayout(props: CatalogLayoutProps): React.JSX.Element {
  return <>{props.children}</>
}
