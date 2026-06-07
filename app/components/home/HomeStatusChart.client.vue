<template>
  <UCard>
    <template #header>
      <p class="text-xs text-muted uppercase">訂單狀態分佈</p>
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: '#f59e0b' },
  paid: { label: '已付款', color: '#3b82f6' },
  shipped: { label: '已出貨', color: '#8b5cf6' },
  delivered: { label: '已送達', color: '#10b981' },
  cancelled: { label: '已取消', color: '#ef4444' },
}

const distData = computed(() => {
  const start = props.range.start.toISOString().slice(0, 10)
  const end = props.range.end.toISOString().slice(0, 10)
  const acc: Record<string, number> = {}
  for (const s of props.snapshots) {
    if (s.date < start || s.date > end) continue
    for (const [k, v] of Object.entries(s.orderStatusDist)) {
      acc[k] = (acc[k] ?? 0) + v
    }
  }
  return Object.entries(acc).filter(([, v]) => v > 0)
})

const isDark = computed(() => colorMode.value === 'dark')

function buildChart() {
  if (!canvasEl.value) return
  chartInstance?.destroy()
  const legendColor = isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'

  chartInstance = new Chart(canvasEl.value, {
    type: 'doughnut',
    data: {
      labels: distData.value.map(([k]) => STATUS_CONFIG[k]?.label ?? k),
      datasets: [{
        data: distData.value.map(([, v]) => v),
        backgroundColor: distData.value.map(([k]) => STATUS_CONFIG[k]?.color ?? '#94a3b8'),
        borderWidth: 0,
        hoverOffset: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: legendColor, boxWidth: 12, padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  })
}

onMounted(async () => { await nextTick(); buildChart() })
onBeforeUnmount(() => chartInstance?.destroy())
watch([distData, isDark], buildChart)
</script>
