import type {
  Product,
  ProductMediaItem,
} from "@features/admin/products/types/products.types"

export type ProductMediaWorkspaceRow = {
  product: Product
  totalMedia: number
  imageCount: number
  videoCount: number
  primaryMedia: ProductMediaItem | null
  items: ProductMediaItem[]
}
