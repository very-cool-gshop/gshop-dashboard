import type { AvatarProps } from '@nuxt/ui'

export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  role: 'customer' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type ProductStatus = 'active' | 'inactive' | 'draft'
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface ProductImage {
  id: number
  url: string
  filename: string
  size: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  categoryId: number
  name: string
  description?: string
  price: number
  imageId?: number | null
  image?: ProductImage | null
  status: ProductStatus
}

export interface ProductVariant {
  id: number
  productId: number
  name: string
  price: number
  stock: number
  imageId?: number | null
  image?: ProductImage | null
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  variantId: number | null
  productName: string
  variantName: string | null
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  userId: number
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  address: string
  recipientName: string
  recipientPhone: string
  note: string | null
  createdAt: string
  updatedAt: string
  OrderItems?: OrderItem[]
  User?: { id: number; username: string; email: string }
}

export interface DashboardSnapshot {
  date: string
  revenue: number | string
  orderCount: number
  newUserCount: number
  avgOrderValue: number | string
  orderStatusDist: Record<string, number>
  topProducts: { productId: number; productName: string; totalRevenue: number; totalQuantity: number }[]
  topCategories: { categoryId: number; categoryName: string; totalRevenue: number; totalQuantity: number }[]
  paymentMethods: { method: string; count: number; amount: number }[]
}

export interface LowStockItem {
  variantId: number
  variantName: string
  stock: number
  productId: number
  productName: string
  productStatus: ProductStatus
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface Job {
  name: string
  schedule: string
  lastRun: string | null
  lastStatus: 'success' | 'error' | null
  lastMessage: string | null
}

export interface JobLog {
  id: number
  jobName: string
  status: 'success' | 'error'
  message: string | null
  duration: number | null
  createdAt: string
}
