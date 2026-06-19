<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="客戶管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div @click.capture="(e) => { if (isViewer) { e.stopPropagation(); e.preventDefault(); requireWrite(() => {}) } }">
            <CustomersAddModal />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <CustomersDetailSlideover v-model:open="detailOpen" :user-id="selectedUserId" />

      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput v-model="searchInput" class="max-w-sm" icon="i-lucide-search" placeholder="搜尋姓名或信箱..." />

        <div class="flex flex-wrap items-center gap-1.5">
          <CustomersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length" @click.capture="(e: Event) => { if (isViewer) { e.stopPropagation(); e.preventDefault(); requireWrite(() => {}) } }">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="刪除"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </CustomersDeleteModal>

          <USelect
            v-model="roleFilter"
            :items="[
              { label: '全部', value: 'all' },
              { label: '管理員', value: 'admin' },
              { label: '客戶', value: 'customer' }
            ]"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="篩選角色"
            class="min-w-28"
          />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          tr: 'cursor-pointer',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
        @select="handleRowSelect"
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
import { getPaginationRowModel } from '@tanstack/table-core'
  import type { User } from '~/types'

  const UAvatar = resolveComponent('UAvatar')
  const UButton = resolveComponent('UButton')
  const UBadge = resolveComponent('UBadge')
  const UCheckbox = resolveComponent('UCheckbox')

  const { isViewer, requireWrite } = usePermission()
  const table = useTemplateRef('table')

  const detailOpen = ref(false)
  const selectedUserId = ref<number | null>(null)

  const columnVisibility = ref()
  const rowSelection = ref({})

  const apiFetch = useApiFetch()
  const searchInput = ref('')
  const roleFilter = ref('all')

  const { data, status, refresh } = await useAsyncData<User[]>(
    'customers',
    () => apiFetch('/users', {
      params: {
        ...(searchInput.value ? { search: searchInput.value } : {}),
        ...(roleFilter.value !== 'all' ? { role: roleFilter.value } : {})
      }
    }),
    { lazy: true }
  )

  watchDebounced(searchInput, () => refresh(), { debounce: 400 })
  watch(roleFilter, () => refresh())

  function handleRowSelect(_e: Event, row: { original: User }) {
    selectedUserId.value = row.original.id
    detailOpen.value = true
  }

  const columns: TableColumn<User>[] = [
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
      header: '姓名',
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center gap-3' }, [
          h(UAvatar, {
            src: row.original.avatar ?? undefined,
            size: 'lg'
          }),
          h('p', { class: 'font-medium text-highlighted' }, row.original.name)
        ])
      }
    },
    {
      accessorKey: 'email',
      header: '信箱'
    },
    {
      accessorKey: 'phone',
      header: '電話',
      cell: ({ row }) => row.original.phone ?? '-'
    },
    {
      accessorKey: 'role',
      header: '權限',
      cell: ({ row }) => {
        const color = {
          admin: 'primary' as const,
          customer: 'neutral' as const
        }[row.original.role]

        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => row.original.role)
      }
    }
  ]



  const pagination = ref({
    pageIndex: 0,
    pageSize: 10
  })
</script>
