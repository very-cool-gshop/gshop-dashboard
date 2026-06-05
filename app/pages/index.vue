<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="首頁" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="通知" :shortcuts="['N']">
            <UButton color="neutral" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" :snapshots="snapshots ?? []" />
      <HomeChart :period="period" :range="range" :snapshots="snapshots ?? []" />
      <HomeSales :period="period" :range="range" :snapshots="snapshots ?? []" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import { sub } from 'date-fns'
  import type { DropdownMenuItem } from '@nuxt/ui'
  import type { Period, Range, DashboardSnapshot } from '~/types'

  const { isNotificationsSlideoverOpen } = useDashboard()
  const apiFetch = useApiFetch()

  const items = [
    [
{
        label: '新增客戶',
        icon: 'i-lucide-user-plus',
        to: '/customers'
      }
    ]
  ] satisfies DropdownMenuItem[][]

  const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date()
  })
  const period = ref<Period>('daily')

  const days = computed(() =>
    Math.ceil((range.value.end.getTime() - range.value.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  )

  const { data: snapshots } = await useAsyncData<DashboardSnapshot[]>(
    'dashboard',
    () => apiFetch('/dashboard', { params: { days: days.value * 2 } }),
    { watch: [range], default: () => [] }
  )
</script>
