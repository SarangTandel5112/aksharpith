import Link from 'next/link'

export default function CatalogNotFound(): React.JSX.Element {
  return (
    <div className="pt-24 px-6 flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Product Not Found</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        The product you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/products"
        className="rounded-full bg-[var(--primary-500)] px-6 py-2.5 text-sm text-white hover:bg-[var(--primary-600)]"
      >
        Back to catalog
      </Link>
    </div>
  )
}
