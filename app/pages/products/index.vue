<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="商品管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ProductsAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput v-model="nameFilter" class="max-w-sm" icon="i-lucide-search" placeholder="搜尋商品名稱..." />

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
            label="刪除"
            color="error"
            variant="subtle"
            icon="i-lucide-trash"
            @click="toast.add({ title: '已刪除選取商品', color: 'error' })"
          >
            <template #trailing>
              <UKbd>{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}</UKbd>
            </template>
          </UButton>

          <USelect
            v-model="statusFilter"
            :items="[
              { label: '全部', value: 'all' },
              { label: '上架中', value: 'active' },
              { label: '草稿', value: 'draft' },
              { label: '已下架', value: 'archived' }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="篩選狀態"
            class="min-w-32"
          />

          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton label="Display" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>
        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import { upperFirst } from 'scule'
  import { getPaginationRowModel } from '@tanstack/table-core'
  import type { Row } from '@tanstack/table-core'
  import type { Product } from '~/types'

  const UBadge = resolveComponent('UBadge')
  const UButton = resolveComponent('UButton')
  const UCheckbox = resolveComponent('UCheckbox')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const toast = useToast()
  const table = useTemplateRef('table')

  const columnFilters = ref([{ id: 'name', value: '' }])
  const columnVisibility = ref()
  const rowSelection = ref({})

  const { data, status } = await useFetch<Product[]>('/api/products', { lazy: true })

  const statusColorMap = {
    active: 'success',
    draft: 'warning',
    archived: 'neutral'
  } as const

  const statusLabelMap = {
    active: '上架中',
    draft: '草稿',
    archived: '已下架'
  }

  function getRowItems(row: Row<Product>) {
    return [
      { type: 'label', label: 'Actions' },
      {
        label: '複製商品 ID',
        icon: 'i-lucide-copy',
        onSelect() {
          navigator.clipboard.writeText(row.original.id.toString())
          toast.add({ title: '已複製到剪貼簿', description: `商品 ID：${row.original.id}` })
        }
      },
      { type: 'separator' as const },
      { label: '編輯商品', icon: 'i-lucide-pencil' },
      { type: 'separator' as const },
      {
        label: '刪除商品',
        icon: 'i-lucide-trash',
        color: 'error' as const,
        onSelect() {
          toast.add({ title: '商品已刪除', description: `${row.original.name} 已被刪除。` })
        }
      }
    ]
  }

  const columns: TableColumn<Product>[] = [
    {
      id: 'select',
      header: ({ table }) =>
        h(UCheckbox, {
          modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
          ariaLabel: 'Select all'
        }),
      cell: ({ row }) =>
        h(UCheckbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
          ariaLabel: 'Select row'
        })
    },
    {
      accessorKey: 'id',
      header: 'ID'
    },
    {
      accessorKey: 'name',
      header: '商品名稱',
      cell: ({ row }) =>
        h('div', { class: 'flex items-center gap-3' }, [
          h('img', { src: row.original.image, class: 'w-10 h-10 rounded object-cover' }),
          h('p', { class: 'font-medium text-highlighted' }, row.original.name)
        ])
    },
    {
      accessorKey: 'category',
      header: '分類'
    },
    {
      accessorKey: 'price',
      header: '售價',
      cell: ({ row }) => `NT$ ${row.original.price.toLocaleString()}`
    },
    {
      accessorKey: 'stock',
      header: '庫存',
      cell: ({ row }) => h('span', { class: row.original.stock === 0 ? 'text-error' : '' }, row.original.stock)
    },
    {
      accessorKey: 'status',
      header: '狀態',
      filterFn: 'equals',
      cell: ({ row }) =>
        h(
          UBadge,
          { variant: 'subtle', color: statusColorMap[row.original.status] },
          () => statusLabelMap[row.original.status]
        )
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        h(
          'div',
          { class: 'text-right' },
          h(
            UDropdownMenu,
            {
              content: { align: 'end' },
              items: getRowItems(row)
            },
            () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto'
              })
          )
        )
    }
  ]

  const statusFilter = ref('all')

  watch(
    () => statusFilter.value,
    (newVal) => {
      if (!table?.value?.tableApi) return
      const statusColumn = table.value.tableApi.getColumn('status')
      if (!statusColumn) return
      statusColumn.setFilterValue(newVal === 'all' ? undefined : newVal)
    }
  )

  const nameFilter = computed({
    get: (): string => (table.value?.tableApi?.getColumn('name')?.getFilterValue() as string) || '',
    set: (value: string) => {
      table.value?.tableApi?.getColumn('name')?.setFilterValue(value || undefined)
    }
  })

  const pagination = ref({ pageIndex: 0, pageSize: 10 })
</script>
