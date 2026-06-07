<template>
  <UCard :ui="{ body: 'p-4!' }">
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase">收入 / 訂單趨勢</p>
        <p class="mt-1 text-2xl font-semibold text-highlighted">
          {{ formatCurrency(totalRevenue) }}
        </p>
      </div>
    </template>
    <div style="height: 240px; position: relative;">
      <canvas ref="canvasEl" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js'
import type { Period, Range, DashboardSnapshot } from '~/types'

const props = defineProps<{
  period: Period
  range: Range
  snapshots: DashboardSnapshot[]
}>()

const colorMode = useColorMode()
const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const toNum = (v: number | string) => parseFloat(String(v)) || 0

const filtered = computed(() => {
  const start = props.range.start.toISOString().slice(0, 10)
  const end = props.range.end.toISOString().slice(0, 10)
  return props.snapshots
    .filter(s => s.date >= start && s.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date))
})

const aggregated = computed(() => {
  if (props.period === 'daily') {
    return filtered.value.map(s => ({ label: s.date, revenue: toNum(s.revenue), orders: s.orderCount }))
  }

  const groupKey = (date: string) => {
    if (props.period === 'weekly') {
      const d = new Date(date + 'T00:00:00')
      const dow = d.getDay() || 7
      const mon = new Date(d)
      mon.setDate(d.getDate() - dow + 1)
      return mon.toISOString().slice(0, 10)
    }
    return date.slice(0, 7)
  }

  const groups = new Map<string, { revenue: number; orders: number }>()
  for (const s of filtered.value) {
    const key = groupKey(s.date)
    const g = groups.get(key) ?? { revenue: 0, orders: 0 }
    g.revenue += toNum(s.revenue)
    g.orders += s.orderCount
    groups.set(key, g)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, d]) => ({ label, ...d }))
})

const totalRevenue = computed(() => aggregated.value.reduce((s, d) => s + d.revenue, 0))

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

const isDark = computed(() => colorMode.value === 'dark')

function buildChart() {
  if (!canvasEl.value) return
  chartInstance?.destroy()
  const grid = isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const ticks = isDark.value ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const pts = aggregated.value.length <= 60 ? 3 : 0

  chartInstance = new Chart(canvasEl.value, {
    type: 'line',
    data: {
      labels: aggregated.value.map(d => d.label),
      datasets: [
        {
          label: '收入',
          data: aggregated.value.map(d => d.revenue),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: pts,
          yAxisID: 'y',
        },
        {
          label: '訂單數',
          data: aggregated.value.map(d => d.orders),
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: pts,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { color: ticks, boxWidth: 12, padding: 16 } },
        tooltip: {
          callbacks: {
            label: ctx =>
              ctx.datasetIndex === 0
                ? ` 收入: ${formatCurrency(ctx.parsed.y)}`
                : ` 訂單: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: { grid: { color: grid }, ticks: { color: ticks, maxTicksLimit: 10 } },
        y: {
          type: 'linear',
          position: 'left',
          grid: { color: grid },
          ticks: { color: ticks, callback: v => `$${Number(v).toLocaleString()}` },
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: ticks },
        },
      },
    },
  })
}

onMounted(async () => { await nextTick(); buildChart() })
onBeforeUnmount(() => chartInstance?.destroy())
watch([aggregated, isDark], buildChart)
</script>
