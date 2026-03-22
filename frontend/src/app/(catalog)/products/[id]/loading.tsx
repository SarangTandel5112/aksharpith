export default function ProductDetailLoading(): React.JSX.Element {
  return (
    <div className="pt-24 px-6 pb-12 max-w-4xl mx-auto animate-pulse space-y-4">
      <div className="h-4 w-24 bg-[var(--surface-subtle)] rounded" />
      <div className="h-8 w-64 bg-[var(--surface-subtle)] rounded" />
      <div className="h-4 w-20 bg-[var(--surface-subtle)] rounded" />
      <div className="h-10 w-32 bg-[var(--surface-subtle)] rounded" />
      <div className="h-20 bg-[var(--surface-subtle)] rounded" />
    </div>
  )
}
