<script setup lang="ts">
  import type { Period, Range, DashboardSnapshot, Stat } from '~/types'

  const props = defineProps<{
    period: Period
    range: Range
    snapshots: DashboardSnapshot[]
  }>()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0

  const toNum = (v: number | string) => parseFloat(String(v)) || 0

  const stats = computed<Stat[]>(() => {
    const start = props.range.start.toISOString().slice(0, 10)
    const end = props.range.end.toISOString().slice(0, 10)

    const current = props.snapshots.filter(s => s.date >= start && s.date <= end)
    const previous = props.snapshots.filter(s => s.date < start)

    const sum = (rows: DashboardSnapshot[], key: 'orderCount' | 'newUserCount') =>
      rows.reduce((acc, r) => acc + r[key], 0)

    const sumRevenue = (rows: DashboardSnapshot[]) =>
      rows.reduce((acc, r) => acc + toNum(r.revenue), 0)

    const avgAov = (rows: DashboardSnapshot[]) =>
      rows.length > 0 ? rows.reduce((acc, r) => acc + toNum(r.avgOrderValue), 0) / rows.length : 0

    const curRevenue = sumRevenue(current)
    const prevRevenue = sumRevenue(previous)
    const curOrders = sum(current, 'orderCount')
    const prevOrders = sum(previous, 'orderCount')
    const curUsers = sum(current, 'newUserCount')
    const prevUsers = sum(previous, 'newUserCount')
    const curAov = avgAov(current)
    const prevAov = avgAov(previous)

    return [
      { title: '新客戶', icon: 'i-lucide-users', value: curUsers, variation: pctChange(curUsers, prevUsers) },
      { title: '客單價', icon: 'i-lucide-chart-pie', value: formatCurrency(curAov), variation: pctChange(curAov, prevAov) },
      { title: '營收', icon: 'i-lucide-circle-dollar-sign', value: formatCurrency(curRevenue), variation: pctChange(curRevenue, prevRevenue) },
      { title: '訂單數', icon: 'i-lucide-shopping-cart', value: curOrders, variation: pctChange(curOrders, prevOrders) },
    ]
  })
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <span class="text-2xl font-semibold text-highlighted">
        {{ stat.value }}
      </span>
    </UPageCard>
  </UPageGrid>
</template>
