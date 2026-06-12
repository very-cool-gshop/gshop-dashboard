<template>
  <UCard>
    <template #header>
      <p class="text-xs text-muted uppercase">訂單狀態分佈</p>
    </template>
    <div style="height: 240px; position: relative;">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>
      <canvas v-else ref="canvasEl" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js'

const apiFetch = useApiFetch()
const colorMode = useColorMode()
const canvasEl = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const loading = ref(true)
const distData = ref<[string, number][]>([])

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:   { label: '待確認', color: '#f59e0b' },
  paid:      { label: '已付款', color: '#3b82f6' },
  shipped:   { label: '已出貨', color: '#8b5cf6' },
  delivered: { label: '已送達', color: '#10b981' },
  cancelled: { label: '已取消', color: '#ef4444' },
}

async function fetchDist() {
  loading.value = true
  try {
    const res = await apiFetch<Record<string, number>>('/dashboard/order-status-dist')
    distData.value = Object.entries(res).filter(([, v]) => v > 0)
  } finally {
    loading.value = false
  }
}

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

onMounted(async () => {
  await fetchDist()
  await nextTick()
  buildChart()
})
onBeforeUnmount(() => chartInstance?.destroy())
watch(isDark, buildChart)
</script>
