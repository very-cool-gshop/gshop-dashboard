<template>
  <UCard>
    <template #header>
      <p class="text-xs text-muted uppercase">熱銷商品</p>
    </template>

    <UTable
      :data="data"
      :columns="columns"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default'
      }"
    />
  </UCard>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import type { TableColumn } from '@nuxt/ui'
  import type { Period, Range, DashboardSnapshot } from '~/types'

  const props = defineProps<{
    period: Period
    range: Range
    snapshots: DashboardSnapshot[]
  }>()

  type TopProduct = {
    productId: number
    productName: string
    totalRevenue: number
    totalQuantity: number
  }

  const data = computed<TopProduct[]>(() => {
    const start = props.range.start.toISOString().slice(0, 10)
    const end = props.range.end.toISOString().slice(0, 10)

    const map = new Map<number, TopProduct>()
    for (const snapshot of props.snapshots) {
      if (snapshot.date < start || snapshot.date > end) continue
      for (const p of snapshot.topProducts) {
        const existing = map.get(p.productId)
        if (existing) {
          existing.totalRevenue += p.totalRevenue
          existing.totalQuantity += p.totalQuantity
        } else {
          map.set(p.productId, { ...p })
        }
      }
    }

    return [...map.values()].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)
  })

  const formatCurrency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format

  const columns: TableColumn<TopProduct>[] = [
    {
      accessorKey: 'productName',
      header: '商品名稱'
    },
    {
      accessorKey: 'totalQuantity',
      header: '銷量',
      cell: ({ row }) => `${row.getValue('totalQuantity')} 件`
    },
    {
      accessorKey: 'totalRevenue',
      header: () => h('div', { class: 'text-right' }, '營收'),
      cell: ({ row }) => h('div', { class: 'text-right font-medium' }, formatCurrency(row.getValue('totalRevenue')))
    }
  ]
</script>
