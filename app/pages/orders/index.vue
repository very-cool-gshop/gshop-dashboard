<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type { Order } from '~/types'

  const UBadge = resolveComponent('UBadge')
  const UButton = resolveComponent('UButton')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const toast = useToast()
  const table = useTemplateRef('table')

  const { data, status } = await useFetch<Order[]>('/api/orders', { lazy: true })

  const search = ref('')
  const statusFilter = ref('all')
  const pagination = ref({ pageIndex: 0, pageSize: 10 })

  const statusColorMap = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  } as const

  const statusLabelMap = {
    pending: '待確認',
    processing: '處理中',
    shipped: '已出貨',
    delivered: '已送達',
    cancelled: '已取消'
  }

  function getRowItems(row: { original: Order }) {
    return [
      { label: '查看詳情', icon: 'i-lucide-eye' },
      { label: '複製訂單編號', icon: 'i-lucide-copy',
        onSelect() {
          navigator.clipboard.writeText(row.original.id)
          toast.add({ title: '已複製訂單編號' })
        }
      },
      { type: 'separator' as const },
      {
        label: '取消訂單',
        icon: 'i-lucide-x-circle',
        color: 'error' as const,
        onSelect() {
          toast.add({ title: `訂單 ${row.original.id} 已取消`, color: 'error' })
        }
      }
    ]
  }

  const columns: TableColumn<Order>[] = [
    {
      accessorKey: 'id',
      header: '訂單編號',
      cell: ({ row }) => h('span', { class: 'font-mono font-medium' }, row.original.id)
    },
    {
      accessorKey: 'customerName',
      header: '買家',
      cell: ({ row }) =>
        h('div', [
          h('p', { class: 'font-medium text-highlighted' }, row.original.customerName),
          h('p', { class: 'text-sm text-muted' }, row.original.customerEmail)
        ])
    },
    {
      accessorKey: 'date',
      header: '日期'
    },
    {
      accessorKey: 'total',
      header: '金額',
      cell: ({ row }) => `NT$ ${row.original.total.toLocaleString()}`
    },
    {
      accessorKey: 'status',
      header: '狀態',
      cell: ({ row }) =>
        h(UBadge, {
          variant: 'subtle',
          color: statusColorMap[row.original.status]
        }, () => statusLabelMap[row.original.status])
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        h('div', { class: 'text-right' },
          h(UDropdownMenu, {
            content: { align: 'end' },
            items: getRowItems(row)
          }, () => h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost',
            class: 'ml-auto'
          }))
        )
    }
  ]

  const filtered = computed(() => {
    if (!data.value) return []
    return data.value.filter(o => {
      const matchSearch = o.id.includes(search.value) || o.customerName.includes(search.value)
      const matchStatus = statusFilter.value === 'all' || o.status === statusFilter.value
      return matchSearch && matchStatus
    })
  })
</script>

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
            { label: '處理中', value: 'processing' },
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
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }"
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
