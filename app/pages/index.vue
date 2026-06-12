<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="數據總覽">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USelect
            v-model="selectedPeriod"
            :items="periodOptions"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            class="w-28"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="status === 'pending'" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
      </div>

      <template v-else-if="snapshots">
        <HomeStats :snapshots="snapshots" :period="period" :range="range" />

        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <HomeRevenueChart class="lg:col-span-2" :snapshots="snapshots" :period="period" :range="range" />
          <HomeStatusChart />
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <HomeSales :snapshots="snapshots" :period="period" :range="range" />
          <HomePaymentChart :snapshots="snapshots" :period="period" :range="range" />
        </div>
      </template>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Period, Range, DashboardSnapshot } from '~/types'

const apiFetch = useApiFetch()

const periodOptions = [
  { label: '近一週', value: 'week' },
  { label: '近一個月', value: 'month' },
  { label: '近三個月', value: '3months' },
  { label: '近六個月', value: '6months' },
]

const selectedPeriod = ref('month')

const range = computed<Range>(() => {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  if (selectedPeriod.value === 'week') start.setDate(start.getDate() - 6)
  else if (selectedPeriod.value === 'month') start.setMonth(start.getMonth() - 1)
  else if (selectedPeriod.value === '3months') start.setMonth(start.getMonth() - 3)
  else start.setMonth(start.getMonth() - 6)
  return { start, end }
})

const period = computed<Period>(() =>
  selectedPeriod.value === 'week' || selectedPeriod.value === 'month' ? 'daily' : 'weekly',
)

const apiDays = computed(() => {
  const diff = Math.ceil((new Date().getTime() - range.value.start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(diff + 1, 7), 365)
})

const { data: snapshots, status } = await useAsyncData<DashboardSnapshot[]>(
  'dashboard',
  () => apiFetch('/dashboard', { params: { days: apiDays.value } }),
  { lazy: true, watch: [apiDays] },
)
</script>
