<script setup lang="ts">
import type { Period, Range, DashboardSnapshot } from '~/types'
defineProps<{ period: Period; range: Range; snapshots: DashboardSnapshot[] }>()
</script>

<template>
  <UCard :ui="{ body: 'p-4!' }">
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase">收入 / 訂單趨勢</p>
        <div class="mt-1 h-7 w-32 animate-pulse rounded bg-elevated" />
      </div>
    </template>
    <div class="h-60 animate-pulse rounded bg-elevated/50" />
  </UCard>
</template>
