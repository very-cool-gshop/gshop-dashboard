import type { Order } from '~/types'

const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Alex Smith',
    customerEmail: 'alex.smith@example.com',
    status: 'delivered',
    total: 2180,
    items: [
      { productId: 1, productName: '無線藍牙耳機', quantity: 1, price: 1290 },
      { productId: 3, productName: '保溫水壺 500ml', quantity: 1, price: 490 },
      { productId: 6, productName: '帆布托特包', quantity: 1, price: 390 }
    ],
    date: '2026-05-18'
  },
  {
    id: 'ORD-002',
    customerName: 'Jordan Brown',
    customerEmail: 'jordan.brown@example.com',
    status: 'shipped',
    total: 2490,
    items: [
      { productId: 5, productName: '機械鍵盤', quantity: 1, price: 2490 }
    ],
    date: '2026-05-19'
  },
  {
    id: 'ORD-003',
    customerName: 'Taylor Green',
    customerEmail: 'taylor.green@example.com',
    status: 'processing',
    total: 1780,
    items: [
      { productId: 2, productName: '輕量後背包', quantity: 1, price: 890 },
      { productId: 6, productName: '帆布托特包', quantity: 1, price: 390 },
      { productId: 3, productName: '保溫水壺 500ml', quantity: 1, price: 490 }
    ],
    date: '2026-05-20'
  },
  {
    id: 'ORD-004',
    customerName: 'Morgan White',
    customerEmail: 'morgan.white@example.com',
    status: 'pending',
    total: 3990,
    items: [
      { productId: 7, productName: '智慧手錶', quantity: 1, price: 3990 }
    ],
    date: '2026-05-21'
  },
  {
    id: 'ORD-005',
    customerName: 'Casey Gray',
    customerEmail: 'casey.gray@example.com',
    status: 'cancelled',
    total: 1290,
    items: [
      { productId: 1, productName: '無線藍牙耳機', quantity: 1, price: 1290 }
    ],
    date: '2026-05-17'
  }
]

export default eventHandler(async () => {
  return orders
})
