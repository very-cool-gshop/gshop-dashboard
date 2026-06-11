<template>
  <UDashboardPanel id="jobs">
    <template #header>
      <UDashboardNavbar title="排程任務">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            :loading="jobsLoading"
            @click="refresh"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientOnly>
      <!-- Jobs List -->
      <UTable
        :data="jobs"
        :columns="jobColumns"
        :loading="jobsLoading"
        :ui="{
          root: 'relative overflow-visible',
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
      />

      <!-- Logs Section -->
      <div class="mt-6">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-highlighted">執行紀錄</p>
          <USelect
            v-model="logJobFilter"
            :items="logFilterItems"
            placeholder="全部任務"
            class="min-w-44"
            @update:model-value="onFilterChange"
          />
        </div>

        <UTable
          :data="logs"
          :columns="logColumns"
          :loading="logsLoading"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default'
          }"
        />

        <div v-if="logsTotal > 10" class="flex justify-center mt-4">
          <UPagination
            v-model:page="logsPage"
            :total="logsTotal"
            :items-per-page="10"
            @update:page="fetchLogs"
          />
        </div>
      </div>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type { Job, JobLog } from '~/types'

  const UBadge = resolveComponent('UBadge')
  const UButton = resolveComponent('UButton')

  const apiFetch = useApiFetch()
  const toast = useToast()

  const jobs = ref<Job[]>([])
  const jobsLoading = ref(false)
  const logs = ref<JobLog[]>([])
  const logsLoading = ref(false)
  const logJobFilter = ref<string | null>(null)
  const logsPage = ref(1)
  const logsTotal = ref(0)
  const runningJob = ref<string | null>(null)

  const logFilterItems = computed(() => [
    { label: '全部任務', value: null },
    ...jobs.value.map(j => ({ label: j.name, value: j.name }))
  ])

  async function fetchJobs() {
    jobsLoading.value = true
    try {
      jobs.value = await apiFetch<Job[]>('/admin/jobs')
    } finally {
      jobsLoading.value = false
    }
  }

  function onFilterChange() {
    logsPage.value = 1
    fetchLogs()
  }

  async function fetchLogs() {
    logsLoading.value = true
    try {
      const params: Record<string, unknown> = { limit: 10, page: logsPage.value }
      if (logJobFilter.value) params.jobName = logJobFilter.value
      const res = await apiFetch<{ total: number; page: number; totalPages: number; data: JobLog[] }>('/admin/jobs/logs', { params })
      logs.value = res.data
      logsTotal.value = res.total
    } finally {
      logsLoading.value = false
    }
  }

  async function triggerJob(name: string) {
    runningJob.value = name
    try {
      const log = await apiFetch<JobLog>(`/admin/jobs/${name}/run`, { method: 'POST' })
      if (log.status === 'success') {
        toast.add({ title: `${name} 執行成功`, color: 'success' })
      } else {
        toast.add({ title: `${name} 執行失敗`, description: log.message ?? '', color: 'error' })
      }
      await Promise.all([fetchJobs(), fetchLogs()])
    } catch {
      toast.add({ title: '觸發失敗', description: '請稍後再試', color: 'error' })
    } finally {
      runningJob.value = null
    }
  }

  async function refresh() {
    await Promise.all([fetchJobs(), fetchLogs()])
  }

  onMounted(() => refresh())

  function parseCron(expr: string): string {
    const [min, hour, dom, month, dow] = expr.trim().split(/\s+/)

    // 每分鐘
    if (expr === '* * * * *') return '每分鐘'

    // 每 n 分鐘
    if (min?.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
      return `每 ${min.slice(2)} 分鐘`
    }

    // 每小時第 n 分
    if (hour === '*' && dom === '*' && month === '*' && dow === '*' && !min?.includes('*') && !min?.includes('/')) {
      return min === '0' ? '每小時' : `每小時 ${min} 分`
    }

    // 每 n 小時（整點）
    if (hour?.startsWith('*/') && dom === '*' && month === '*' && dow === '*' && !min?.includes('*') && !min?.includes('/')) {
      return min === '0' ? `每 ${hour.slice(2)} 小時` : `每 ${hour.slice(2)} 小時 ${min} 分`
    }

    // 每天 hh:mm（指定時分，dom/month/dow 全 *）
    if (dom === '*' && month === '*' && dow === '*' && !min?.includes('*') && !hour?.includes('*')) {
      const h = hour!.padStart(2, '0')
      const m = min!.padStart(2, '0')
      return `每天 ${h}:${m}`
    }

    // 每週幾 hh:mm
    if (dom === '*' && month === '*' && dow !== '*' && !min?.includes('*') && !hour?.includes('*')) {
      const days = ['日', '一', '二', '三', '四', '五', '六']
      const dayLabel = dow!.split(',').map(d => `週${days[Number(d)]}`).join('、')
      const h = hour!.padStart(2, '0')
      const m = min!.padStart(2, '0')
      return `每${dayLabel} ${h}:${m}`
    }

    // 每月幾號 hh:mm
    if (dom !== '*' && month === '*' && dow === '*' && !min?.includes('*') && !hour?.includes('*')) {
      const h = hour!.padStart(2, '0')
      const m = min!.padStart(2, '0')
      return `每月 ${dom} 號 ${h}:${m}`
    }

    return expr
  }

  function formatDuration(ms: number | null) {
    if (ms === null) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  function formatTime(iso: string | null) {
    if (!iso) return '-'
    return new Date(iso).toLocaleString('zh-TW', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  const jobColumns: TableColumn<Job>[] = [
    {
      accessorKey: 'name',
      header: '任務名稱',
      cell: ({ row }) => h('span', { class: 'font-mono font-medium' }, row.original.name)
    },
    {
      accessorKey: 'schedule',
      header: 'Cron 排程',
      cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-sm' }, parseCron(row.original.schedule)),
        h('span', { class: 'font-mono text-xs text-muted' }, row.original.schedule),
      ])
    },
    {
      accessorKey: 'lastRun',
      header: '上次執行',
      cell: ({ row }) => formatTime(row.original.lastRun)
    },
    {
      accessorKey: 'lastStatus',
      header: '狀態',
      size: 100,
      cell: ({ row }) => {
        const status = row.original.lastStatus
        if (!status) return h('span', { class: 'text-muted text-sm' }, '-')
        return h(UBadge, {
          variant: 'subtle',
          color: status === 'success' ? 'success' : 'error'
        }, () => status === 'success' ? '成功' : '失敗')
      }
    },
    {
      accessorKey: 'lastMessage',
      header: '訊息',
      cell: ({ row }) => {
        const msg = row.original.lastMessage
        if (!msg) return h('span', { class: 'text-muted text-sm' }, '-')
        return h('span', { class: 'text-sm truncate max-w-xs block', title: msg }, msg)
      }
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) =>
        h(UButton, {
          label: '執行',
          size: 'sm',
          variant: 'subtle',
          icon: 'i-lucide-play',
          loading: runningJob.value === row.original.name,
          disabled: runningJob.value !== null,
          onClick: () => triggerJob(row.original.name)
        })
    }
  ]

  const logColumns: TableColumn<JobLog>[] = [
    {
      accessorKey: 'jobName',
      header: '任務',
      cell: ({ row }) => h('span', { class: 'font-mono text-sm' }, row.original.jobName)
    },
    {
      accessorKey: 'status',
      header: '結果',
      size: 90,
      cell: ({ row }) =>
        h(UBadge, {
          variant: 'subtle',
          color: row.original.status === 'success' ? 'success' : 'error'
        }, () => row.original.status === 'success' ? '成功' : '失敗')
    },
    {
      accessorKey: 'duration',
      header: '耗時',
      size: 90,
      cell: ({ row }) => formatDuration(row.original.duration)
    },
    {
      accessorKey: 'message',
      header: '訊息',
      cell: ({ row }) => {
        const msg = row.original.message
        if (!msg) return h('span', { class: 'text-muted text-sm' }, '-')
        return h('span', { class: 'text-sm truncate max-w-md block', title: msg }, msg)
      }
    },
    {
      accessorKey: 'createdAt',
      header: '時間',
      size: 150,
      cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, formatTime(row.original.createdAt))
    }
  ]
</script>
