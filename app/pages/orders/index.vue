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
        <UInput v-model="search" icon="i-lucide-search" placeholder="搜尋訂單編號或買家..." class="max-w-sm" />
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
        ref="table"
        v-model:pagination="pagination"
        class="shrink-0"
        :data="filtered"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          tr: 'cursor-pointer hover:bg-(--ui-bg-elevated)/50 transition-colors',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
        @select="(_e: Event, row) => navigateTo(`/orders/${row.original.id}/edit`)"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <p class="text-sm text-muted">共 {{ filtered.length }} 筆訂單</p>
        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="filtered.length"
          @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type { Order } from '~/types'

  const UBadge = resolveComponent('UBadge')

  const table = useTemplateRef('table')

  const apiFetch = useApiFetch()
  const { data: ordersRes, status } = await useAsyncData<{ data: Order[] }>(
    'orders',
    () => apiFetch('/orders', { params: { limit: 200 } }),
    { lazy: true }
  )

  const search = ref('')
  const statusFilter = ref('all')
  const pagination = ref({ pageIndex: 0, pageSize: 10 })

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

  const filtered = computed(() => {
    const orders = ordersRes.value?.data ?? []
    return orders.filter((o) => {
      const matchSearch = String(o.id).includes(search.value) || o.recipientName.includes(search.value)
      const matchStatus = statusFilter.value === 'all' || o.status === statusFilter.value
      return matchSearch && matchStatus
    })
  })
</script>
