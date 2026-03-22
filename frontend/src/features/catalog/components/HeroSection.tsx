'use client'

import { BackgroundBeams } from '@shared/components/aceternity/BackgroundBeams'
import Link                from 'next/link'

export function HeroSection(): React.JSX.Element {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-[var(--bg-dark)] px-4 text-center">
      <BackgroundBeams />
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <span className="rounded-full border border-[var(--primary-alpha-2)] bg-[var(--primary-alpha-1)] px-4 py-1 text-xs font-medium text-[var(--primary-400)]">
          Digital Catalog
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Aksharpith
          <span className="block text-[var(--primary-400)]">Product Catalog</span>
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-md">
          Browse our complete product range. Use filters to find exactly what you need.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-[var(--primary-500)] hover:bg-[var(--primary-600)] px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Browse Products →
        </Link>
      </div>
    </section>
  )
}
