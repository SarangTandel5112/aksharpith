import { LotMatrixWizard } from '@features/admin/variants/components/LotMatrixWizard'
import Link                 from 'next/link'

export default async function VariantsPage(
  props: { params: Promise<{ id: string }> },
): Promise<React.JSX.Element> {
  const { id } = await props.params
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/products" className="text-sm text-[var(--primary-500)] hover:underline">
          ← Products
        </Link>
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Product Variants
        </h1>
      </div>
      <div className="mb-8">
        <h2 className="text-base font-medium mb-3 text-[var(--text-heading)]">
          Generate Variants via Lot Matrix
        </h2>
        <LotMatrixWizard productId={id} />
      </div>
    </div>
  )
}
