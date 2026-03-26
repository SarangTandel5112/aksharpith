import { ProductViewPage } from "@features/admin/products/components/ProductViewPage";
import type React from "react";

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await props.params;
  return <ProductViewPage productId={id} />;
}
