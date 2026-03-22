export type Product = {
  id:            string
  name:          string
  description:   string
  sku:           string
  price:         number
  category:      { id: string; name: string }
  subCategory:   { id: string; name: string }
  department:    { id: string; name: string }
  createdAt:     string
  updatedAt:     string
}
