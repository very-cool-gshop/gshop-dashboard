<template>
  <UCard>
    <template #header>
      <p class="text-xs text-muted uppercase">付款方式</p>
    </template>
    <div :style="{ height: Math.max(100, payData.length * 56) + 'px', position: 'relative' }">
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

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const payData = computed(() => {
  const start = props.range.start.toISOString().slice(0, 10)
  const end = props.range.end.toISOString().slice(0, 10)
  const map = new Map<string, { count: number; amount: number }>()
  for (const s of props.snapshots) {
    if (s.date < start || s.date > end) continue
    for (const p of s.paymentMethods) {
      const cur = map.get(p.method) ?? { count: 0, amount: 0 }
      cur.count += p.count
      cur.amount += p.amount
      map.set(p.method, cur)
    }
  }
  return [...map.entries()].sort(([, a], [, b]) => b.amount - a.amount)
})

const isDark = computed(() => colorMode.value === 'dark')

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

function buildChart() {
  if (!canvasEl.value) return
  chartInstance?.destroy()
  const grid = isDark.value ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const ticks = isDark.value ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'

  chartInstance = new Chart(canvasEl.value, {
    type: 'bar',
    data: {
      labels: payData.value.map(([m]) => m),
      datasets: [{
        label: '金額',
        data: payData.value.map(([, d]) => d.amount),
        backgroundColor: payData.value.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 4,
        barThickness: 28,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatCurrency(ctx.parsed.x)}`,
            afterLabel: ctx => ` 筆數: ${payData.value[ctx.dataIndex]?.[1].count ?? 0}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: { color: ticks, callback: v => `$${Number(v).toLocaleString()}` },
        },
        y: { grid: { display: false }, ticks: { color: ticks } },
      },
    },
  })
}

onMounted(async () => { await nextTick(); buildChart() })
onBeforeUnmount(() => chartInstance?.destroy())
watch([payData, isDark], buildChart)
</script>
