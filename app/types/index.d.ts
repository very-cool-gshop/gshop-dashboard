import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
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
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

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
  productId: number
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}
