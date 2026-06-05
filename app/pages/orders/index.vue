<template>
  <UDashboardPanel id="orders">
    <template #header>
      <UDashboardNavbar title="訂單管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex items-center gap-1.5 max-w-sm w-full">
          <UInput v-model="search" icon="i-lucide-search" :placeholder="searchType === 'orderId' ? '搜尋訂單編號...' : '搜尋買家 ID...'" class="flex-1" />
          <USelect
            v-model="searchType"
            :items="[
              { label: '訂單編號', value: 'orderId' },
              { label: '買家 ID', value: 'userId' }
            ]"
            class="min-w-28"
          />
        </div>
        <USelect
          v-model="statusFilter"
          :items="[
            { label: '全部', value: 'all' },
            { label: '待確認', value: 'pending' },
            { label: '已付款', value: 'paid' },
            { label: '已出貨', value: 'shipped' },
            { label: '已送達', value: 'delivered' },
            { label: '已取消', value: 'cancelled' }
          ]"
          placeholder="篩選狀態"
          class="min-w-32"
        />
      </div>

      <UTable
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="loading"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          tr: 'cursor-pointer hover:bg-(--ui-bg-elevated)/50 transition-colors',
          th: 'py-2 whitespace-nowrap first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
        @select="(_e: Event, row) => navigateTo(`/orders/${row.original.id}/edit`)"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <p class="text-sm text-muted">共 {{ total }} 筆訂單</p>
        <UPagination
          v-model:page="currentPage"
          :items-per-page="pageSize"
          :total="total"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type { Order } from '~/types'

  const UBadge = resolveComponent('UBadge')

  const apiFetch = useApiFetch()

  const loading = ref(false)
  const data = ref<Order[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = 20

  const search = ref('')
  const searchType = ref<'orderId' | 'userId'>('orderId')
  const statusFilter = ref('all')

  async function fetchOrders() {
    loading.value = true
    try {
      const params: Record<string, unknown> = { page: currentPage.value, limit: pageSize }
      if (statusFilter.value !== 'all') params.status = statusFilter.value
      if (search.value) params[searchType.value] = search.value

      const result = await apiFetch<{ total: number; page: number; totalPages: number; data: Order[] }>(
        '/orders',
        { params }
      )
      data.value = result.data
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  onMounted(() => fetchOrders())
  watch(currentPage, () => fetchOrders())

  const debouncedFetch = useDebounceFn(() => {
    currentPage.value = 1
    fetchOrders()
  }, 300)

  watch(search, debouncedFetch)
  watch(searchType, () => {
    if (search.value) debouncedFetch()
  })
  watch(statusFilter, () => {
    currentPage.value = 1
    fetchOrders()
  })

  const statusColorMap = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  } as const

  const statusLabelMap = {
    pending: '待確認',
    paid: '已付款',
    shipped: '已出貨',
    delivered: '已送達',
    cancelled: '已取消'
  }

  const columns: TableColumn<Order>[] = [
    {
      accessorKey: 'id',
      header: '訂單編號',
      cell: ({ row }) => h('span', { class: 'font-mono font-medium' }, row.original.id)
    },
    {
      accessorKey: 'userId',
      header: '用戶 ID',
      cell: ({ row }) => h('span', { class: 'font-mono text-muted' }, row.original.userId)
    },
    {
      accessorKey: 'recipientName',
      header: '收件者',
      cell: ({ row }) =>
        h('div', [
          h('p', { class: 'font-medium text-highlighted' }, row.original.recipientName),
          h('p', { class: 'text-sm text-muted' }, row.original.recipientPhone)
        ])
    },
    {
      accessorKey: 'createdAt',
      header: '日期',
      cell: ({ row }) => row.original.createdAt.slice(0, 10)
    },
    {
      accessorKey: 'totalAmount',
      header: '金額',
      cell: ({ row }) => `NT$ ${Number(row.original.totalAmount).toLocaleString()}`
    },
    {
      accessorKey: 'status',
      header: '狀態',
      cell: ({ row }) =>
        h(
          UBadge,
          {
            variant: 'subtle',
            color: statusColorMap[row.original.status]
          },
          () => statusLabelMap[row.original.status]
        )
    }
  ]
</script>
