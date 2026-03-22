'use client'

import { useProductDetail } from '../hooks/useProducts'
import Link                  from 'next/link'

type ProductDetailProps = {
  productId: string
}

export function ProductDetail(props: ProductDetailProps): React.JSX.Element {
  const { data, isLoading, isError } = useProductDetail(props.productId)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl">
        <div className="h-8 bg-[var(--surface-subtle)] rounded w-2/3" />
        <div className="h-4 bg-[var(--surface-subtle)] rounded w-1/4" />
        <div className="h-24 bg-[var(--surface-subtle)] rounded" />
      </div>
    )
  }

  if (isError || data === undefined) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-[var(--color-danger)]">Failed to load product.</p>
        <Link href="/products" className="text-sm text-[var(--primary-500)] underline">
          Back to catalog
        </Link>
      </div>
    )
  }

  const product = data.data

  return (
    <article className="max-w-2xl">
      <Link href="/products" className="text-sm text-[var(--primary-500)] hover:underline mb-4 inline-block">
        ← Back to catalog
      </Link>

      <span className="inline-flex rounded-full bg-[var(--primary-alpha-1)] px-2 py-0.5 text-xs font-medium text-[var(--primary-500)] mb-3">
        {product.category?.name}
      </span>

      <h1 className="text-2xl font-bold text-[var(--text-heading)] mb-1">{product.name}</h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">SKU: {product.sku}</p>

      <p className="text-3xl font-bold text-[var(--primary-400)] mb-6">
        ₹{product.basePrice?.toLocaleString('en-IN')}
      </p>

      <div className="prose-sm text-[var(--text-body)] mb-6">
        <p>{product.description}</p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        <span>Department: <strong className="text-[var(--text-body)]">{product.department?.name}</strong></span>
        {product.subCategory !== null && (
          <span>Sub-Category: <strong className="text-[var(--text-body)]">{product.subCategory?.name}</strong></span>
        )}
      </div>
    </article>
  )
}
