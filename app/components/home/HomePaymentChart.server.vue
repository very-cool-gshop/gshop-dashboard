<script setup lang="ts">
import type { Period, Range, DashboardSnapshot } from '~/types'
defineProps<{ period: Period; range: Range; snapshots: DashboardSnapshot[] }>()
</script>

<template>
  <UCard>
    <template #header>
      <p class="text-xs text-muted uppercase">付款方式</p>
    </template>
    <div class="h-60 animate-pulse rounded bg-elevated/50" />
  </UCard>
</template>
