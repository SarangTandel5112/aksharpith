'use client'

import type React from "react"
import { PageHeader, StatusBadge } from "@shared/components/admin"
import {
  IconArrowUpRight,
  IconMinus,
  IconPackage,
  IconCategory,
  IconBuildingStore,
  IconUsers,
} from "@tabler/icons-react"
import { cn } from "@shared/lib/cn"

// ── Types ─────────────────────────────────────────────────────────────────────

type StatTrend = "up" | "neutral"

type Stat = {
  label: string
  value: string
  change: string
  trend: StatTrend
  icon: React.ComponentType<{ size?: number; className?: string }>
}

type RecentProduct = {
  id: string
  name: string
  sku: string
  department: string
  price: number
  isActive: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const STATS: readonly Stat[] = [
  { label: "Total Products", value: "248", change: "+12 this month", trend: "up", icon: IconPackage },
  { label: "Active Categories", value: "18", change: "Across 6 departments", trend: "neutral", icon: IconCategory },
  { label: "Departments", value: "6", change: "All active", trend: "neutral", icon: IconBuildingStore },
  { label: "Total Users", value: "14", change: "+2 this week", trend: "up", icon: IconUsers },
] as const

const RECENT_PRODUCTS: readonly RecentProduct[] = [
  { id: "1", name: "iPhone 15 Pro", sku: "IPH-15-PRO", department: "Electronics", price: 134900, isActive: true },
  { id: "2", name: "Men's Cotton T-Shirt", sku: "TSH-MEN-001", department: "Clothing", price: 599, isActive: true },
  { id: "3", name: "Wireless Headphones", sku: "WH-BT-200", department: "Electronics", price: 4999, isActive: true },
  { id: "4", name: "Organic Green Tea", sku: "TEA-ORG-100", department: "Food & Beverage", price: 299, isActive: false },
  { id: "5", name: "Running Shoes", sku: "SHO-RUN-M42", department: "Clothing", price: 3499, isActive: true },
] as const

// ── Sub-components ────────────────────────────────────────────────────────────

type StatCardProps = {
  stat: Stat
}

function StatCard(props: StatCardProps): React.JSX.Element {
  const Icon = props.stat.icon
  const TrendIcon = props.stat.trend === "up" ? IconArrowUpRight : IconMinus
  const trendClass = props.stat.trend === "up" ? "text-emerald-600" : "text-zinc-400"

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-700">{props.stat.label}</p>
        </div>
        <div className="p-2 bg-zinc-100 rounded-md">
          <Icon size={18} className="text-zinc-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-zinc-900 mt-3">{props.stat.value}</p>
      <div className={cn("flex items-center gap-1 mt-1 text-xs", trendClass)}>
        <TrendIcon size={13} />
        <span>{props.stat.change}</span>
      </div>
    </div>
  )
}

type ProductRowProps = {
  product: RecentProduct
}

function ProductRow(props: ProductRowProps): React.JSX.Element {
  return (
    <tr className="border-t border-zinc-100 hover:bg-zinc-50">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-900">{props.product.name}</p>
          <p className="text-xs text-zinc-500">{props.product.sku}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-700">{props.product.department}</td>
      <td className="px-4 py-3 text-sm text-zinc-700">
        ₹{props.product.price.toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          label={props.product.isActive ? "Active" : "Inactive"}
          variant={props.product.isActive ? "success" : "neutral"}
        />
      </td>
    </tr>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardModule(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your store" />

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Recent Products */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Recent Products</h2>
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Name / SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {RECENT_PRODUCTS.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
