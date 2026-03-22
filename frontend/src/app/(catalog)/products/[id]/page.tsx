import { ProductDetail } from '@features/catalog/components/ProductDetail'

export default async function ProductDetailPage(
  props: { params: Promise<{ id: string }> },
): Promise<React.JSX.Element> {
  const { id } = await props.params
  return (
    <div className="pt-24 px-6 pb-12 max-w-4xl mx-auto">
      <ProductDetail productId={id} />
    </div>
  )
}
