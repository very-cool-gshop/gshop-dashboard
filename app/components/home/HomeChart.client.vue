<template>
  <UCard ref="cardRef" :ui="{ root: 'overflow-visible', body: 'px-0! pt-0! pb-3!' }">
    <template #header>
      <div>
        <p class="text-xs text-muted uppercase mb-1.5">營收走勢</p>
        <p class="text-3xl text-highlighted font-semibold">
          {{ formatNumber(total) }}
        </p>
      </div>
    </template>

    <VisXYContainer :data="data" :padding="{ top: 40 }" class="h-96" :width="width">
      <VisLine :x="x" :y="y" color="var(--ui-primary)" />
      <VisArea :x="x" :y="y" color="var(--ui-primary)" :opacity="0.1" />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />

      <VisCrosshair color="var(--ui-primary)" :template="template" />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<script setup lang="ts">
  import { format } from 'date-fns'
  import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
  import type { Period, Range, DashboardSnapshot } from '~/types'

  const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

  const props = defineProps<{
    period: Period
    range: Range
    snapshots: DashboardSnapshot[]
  }>()

  type DataRecord = {
    date: Date
    amount: number
  }

  const { width } = useElementSize(cardRef)

  const data = computed<DataRecord[]>(() => {
    const start = props.range.start.toISOString().slice(0, 10)
    const end = props.range.end.toISOString().slice(0, 10)

    return props.snapshots
      .filter(s => s.date >= start && s.date <= end)
      .map(s => ({ date: new Date(s.date + 'T00:00:00'), amount: parseFloat(String(s.revenue)) || 0 }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  })

  const x = (_: DataRecord, i: number) => i
  const y = (d: DataRecord) => d.amount

  const total = computed(() => data.value.reduce((acc, { amount }) => acc + amount, 0))

  const formatNumber = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    .format

  const xTicks = (i: number) => {
    if (i === 0 || i === data.value.length - 1 || !data.value[i]) return ''
    return format(data.value[i].date, 'd MMM')
  }

  const template = (d: DataRecord) => `${format(d.date, 'd MMM')}: ${formatNumber(d.amount)}`
</script>

<style scoped>
  .unovis-xy-container {
    --vis-crosshair-line-stroke-color: var(--ui-primary);
    --vis-crosshair-circle-stroke-color: var(--ui-bg);

    --vis-axis-grid-color: var(--ui-border);
    --vis-axis-tick-color: var(--ui-border);
    --vis-axis-tick-label-color: var(--ui-text-dimmed);

    --vis-tooltip-background-color: var(--ui-bg);
    --vis-tooltip-border-color: var(--ui-border);
    --vis-tooltip-text-color: var(--ui-text-highlighted);
  }
</style>
