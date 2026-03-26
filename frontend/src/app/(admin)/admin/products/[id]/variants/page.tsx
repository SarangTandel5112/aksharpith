import { VariantWorkspace } from "@features/admin/variants/components/VariantWorkspace";
import type React from "react";

export default async function VariantsPage(
  props: { params: Promise<{ id: string }> },
): Promise<React.JSX.Element> {
  const { id } = await props.params;
  return <VariantWorkspace productId={id} />;
}
