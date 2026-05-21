import type { Product } from '~/types'

const products: Product[] = [
  { id: 1, name: '無線藍牙耳機', category: '3C', price: 1290, stock: 45, status: 'active', image: 'https://placehold.co/80x80?text=耳機' },
  { id: 2, name: '輕量後背包', category: '包包', price: 890, stock: 30, status: 'active', image: 'https://placehold.co/80x80?text=背包' },
  { id: 3, name: '保溫水壺 500ml', category: '生活', price: 490, stock: 120, status: 'active', image: 'https://placehold.co/80x80?text=水壺' },
  { id: 4, name: '瑜珈墊', category: '運動', price: 650, stock: 0, status: 'draft', image: 'https://placehold.co/80x80?text=瑜珈墊' },
  { id: 5, name: '機械鍵盤', category: '3C', price: 2490, stock: 15, status: 'active', image: 'https://placehold.co/80x80?text=鍵盤' },
  { id: 6, name: '帆布托特包', category: '包包', price: 390, stock: 60, status: 'active', image: 'https://placehold.co/80x80?text=托特包' },
  { id: 7, name: '智慧手錶', category: '3C', price: 3990, stock: 20, status: 'active', image: 'https://placehold.co/80x80?text=手錶' },
  { id: 8, name: '復古球鞋', category: '鞋子', price: 1890, stock: 0, status: 'archived', image: 'https://placehold.co/80x80?text=球鞋' }
]

export default eventHandler(async () => {
  return products
})
