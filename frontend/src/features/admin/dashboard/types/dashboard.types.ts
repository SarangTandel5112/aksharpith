export type DashboardStat = {
  label: string
  value: string
  change: string
  trend: "up" | "neutral"
  icon: "products" | "categories" | "departments" | "users"
}

export type DashboardRecentItem = {
  id: string
  name: string
  subtitle: string
  amount: string
  isActive: boolean
}
