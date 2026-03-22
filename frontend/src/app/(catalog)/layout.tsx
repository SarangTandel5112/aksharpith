import { FloatingNav } from '@shared/components/aceternity/FloatingNav'

const NAV_ITEMS = [
  { name: 'Home',     link: '/' },
  { name: 'Products', link: '/products' },
]

type CatalogLayoutProps = { children: React.ReactNode }

export default function CatalogLayout(props: CatalogLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <FloatingNav navItems={NAV_ITEMS} />
      {props.children}
    </div>
  )
}
