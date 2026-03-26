import type {
  Product,
  ProductMarketingMediaItem,
} from "@features/admin/products/types/products.types"

export type ProductMarketingWorkspaceRow = {
  product: Product
  totalAssets: number
  photoCount: number
  videoCount: number
  heroAsset: ProductMarketingMediaItem | null
  items: ProductMarketingMediaItem[]
}
