<template>
  <UDashboardPanel id="categories">
    <template #header>
      <UDashboardNavbar title="商品類別">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="新增類別" @click="requireWrite(openCreate)" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex justify-end min-h-8 mb-2">
        <UButton
          v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
          label="刪除"
          color="error"
          variant="subtle"
          icon="i-lucide-trash"
          :loading="batchDeleteLoading"
          @click="requireWrite(confirmBatchDelete)"
        >
          <template #trailing>
            <UKbd>{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}</UKbd>
          </template>
        </UButton>
      </div>

      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="categories"
        :columns="columns"
        :loading="loading"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          tr: 'cursor-pointer hover:bg-elevated/50',
        }"
        @select="onRowSelect"
      />
    </template>
  </UDashboardPanel>

  <!-- Create / Edit Modal -->
  <UModal v-model:open="modalOpen" :title="editing ? '編輯類別' : '新增類別'">
    <template #body>
      <UForm :state="form" class="flex flex-col gap-4" @submit="onSubmit">
        <UFormField label="類別名稱" name="name" required>
          <UInput v-model="form.name" placeholder="例：服飾" class="w-full" />
        </UFormField>
        <UFormField label="敘述" name="description">
          <UTextarea v-model="form.description" placeholder="類別說明（選填）" class="w-full" />
        </UFormField>
        <UFormField label="排序" name="sortOrder">
          <UInput v-model.number="form.sortOrder" type="number" placeholder="0" class="w-full" />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton label="取消" color="neutral" variant="ghost" type="button" @click="modalOpen = false" />
        <UButton :label="editing ? '儲存' : '建立'" :loading="submitting" type="button" @click="onSubmit" />
      </div>
    </template>
  </UModal>

  <!-- 刪除確認 Modal -->
  <UModal v-model:open="deleteConfirmOpen" title="刪除類別">
    <template #body>
      <p class="text-sm text-(--ui-text-muted)">
        確定要刪除
        <span class="font-semibold text-(--ui-text)">{{ deleteTargetNames }}</span>
        ？此操作無法復原。
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="取消" color="neutral" variant="ghost" @click="deleteConfirmOpen = false" />
        <UButton label="刪除" color="error" :loading="deleteLoading" @click="executeDelete" />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import type { TableColumn, TableRow } from '@nuxt/ui'

  interface Category {
    id: number
    name: string
    description: string | null
    sortOrder: number
  }

  const UCheckbox = resolveComponent('UCheckbox')

  const { isViewer, requireWrite } = usePermission()
  const apiFetch = useApiFetch()
  const toast = useToast()
  const table = useTemplateRef('table')

  const categories = ref<Category[]>([])
  const loading = ref(false)
  const rowSelection = ref({})

  async function fetchCategories() {
    loading.value = true
    try {
      categories.value = await apiFetch<Category[]>('/categories')
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchCategories)

  // ── Modal ──
  const modalOpen = ref(false)
  const submitting = ref(false)
  const editing = ref<Category | null>(null)
  const form = reactive({ name: '', description: '', sortOrder: 0 })

  function openCreate() {
    editing.value = null
    form.name = ''
    form.description = ''
    form.sortOrder = 0
    modalOpen.value = true
  }

  function onRowSelect(_e: Event, row: TableRow<Category>) {
    requireWrite(() => openEdit(row.original))
  }

  function openEdit(category: Category) {
    editing.value = category
    form.name = category.name
    form.description = category.description ?? ''
    form.sortOrder = category.sortOrder
    modalOpen.value = true
  }

  async function onSubmit() {
    if (!form.name.trim()) return
    submitting.value = true
    try {
      if (editing.value) {
        const updated = await apiFetch<Category>(`/categories/${editing.value.id}`, {
          method: 'PATCH',
          body: { name: form.name.trim(), description: form.description.trim() || null, sortOrder: form.sortOrder }
        })
        const idx = categories.value.findIndex(c => c.id === updated.id)
        if (idx !== -1) categories.value[idx] = updated
        toast.add({ title: '已更新', color: 'success' })
      } else {
        const created = await apiFetch<Category>('/categories', {
          method: 'POST',
          body: { name: form.name.trim(), description: form.description.trim() || null, sortOrder: form.sortOrder }
        })
        categories.value.push(created)
        toast.add({ title: '類別已建立', color: 'success' })
      }
      modalOpen.value = false
    } catch {
      toast.add({ title: '操作失敗', description: '請稍後再試', color: 'error' })
    } finally {
      submitting.value = false
    }
  }

  // ── Delete ──
  const deleteConfirmOpen = ref(false)
  const deleteLoading = ref(false)
  const batchDeleteLoading = ref(false)
  const deleteTargetIds = ref<number[]>([])
  const deleteTargetNames = ref('')

  function confirmBatchDelete() {
    const rows = table.value?.tableApi?.getFilteredSelectedRowModel().rows ?? []
    deleteTargetIds.value = rows.map(r => r.original.id)
    deleteTargetNames.value = rows.length === 1
      ? `「${rows[0]!.original.name}」`
      : `${rows.length} 個類別`
    deleteConfirmOpen.value = true
  }

  async function executeDelete() {
    deleteLoading.value = true
    try {
      await Promise.all(deleteTargetIds.value.map(id => apiFetch(`/categories/${id}`, { method: 'DELETE' })))
      toast.add({ title: '刪除成功', description: `${deleteTargetNames.value} 已刪除`, color: 'success' })
      deleteConfirmOpen.value = false
      rowSelection.value = {}
      await fetchCategories()
    } catch {
      toast.add({ title: '刪除失敗', description: '請稍後再試', color: 'error' })
    } finally {
      deleteLoading.value = false
    }
  }

  // ── Columns ──
  const columns: TableColumn<Category>[] = [
    {
      id: 'select',
      size: 40,
      header: ({ table }) =>
        h(UCheckbox, {
          modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
          ariaLabel: 'Select all',
          onClick: (e: Event) => e.stopPropagation()
        }),
      cell: ({ row }) =>
        h(UCheckbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
          ariaLabel: 'Select row',
          onClick: (e: Event) => e.stopPropagation()
        })
    },
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: '類別名稱' },
    { accessorKey: 'description', header: '敘述' },
    { accessorKey: 'sortOrder', header: '排序', size: 80, meta: { class: { th: 'whitespace-nowrap' } } },
  ]
</script>
