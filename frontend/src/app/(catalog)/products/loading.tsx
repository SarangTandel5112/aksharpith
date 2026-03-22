export default function ProductsLoading(): React.JSX.Element {
  return (
    <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
      <div className="h-8 w-40 bg-[var(--surface-subtle)] rounded animate-pulse mb-8" />
      <div className="flex gap-8">
        <div className="w-56 space-y-4">
          {Array.from({ length: 4 }, (_, i) => `sidebar-skel-${i}`).map((key) => (
            <div key={key} className="h-6 bg-[var(--surface-subtle)] rounded animate-pulse" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }, (_, i) => `grid-skel-${i}`).map((key) => (
            <div key={key} className="h-52 bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
