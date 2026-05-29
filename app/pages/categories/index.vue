<template>
  <UDashboardPanel id="categories">
    <template #header>
      <UDashboardNavbar title="商品類別">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="新增類別" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :data="categories"
        :columns="columns"
        :loading="loading"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
        }"
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
</template>

<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'

  interface Category {
    id: number
    name: string
    sortOrder: number
  }

  const UButton = resolveComponent('UButton')

  const apiFetch = useApiFetch()
  const toast = useToast()

  const categories = ref<Category[]>([])
  const loading = ref(false)

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
  const form = reactive({ name: '', sortOrder: 0 })

  function openCreate() {
    editing.value = null
    form.name = ''
    form.sortOrder = 0
    modalOpen.value = true
  }

  function openEdit(category: Category) {
    editing.value = category
    form.name = category.name
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
          body: { name: form.name.trim(), sortOrder: form.sortOrder }
        })
        const idx = categories.value.findIndex(c => c.id === updated.id)
        if (idx !== -1) categories.value[idx] = updated
        toast.add({ title: '已更新', color: 'success' })
      } else {
        const created = await apiFetch<Category>('/categories', {
          method: 'POST',
          body: { name: form.name.trim(), sortOrder: form.sortOrder }
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
  const deletingId = ref<number | null>(null)

  async function deleteCategory(category: Category) {
    deletingId.value = category.id
    try {
      await apiFetch(`/categories/${category.id}`, { method: 'DELETE' })
      categories.value = categories.value.filter(c => c.id !== category.id)
      toast.add({ title: '已刪除', description: `「${category.name}」已刪除`, color: 'success' })
    } catch {
      toast.add({ title: '刪除失敗', color: 'error' })
    } finally {
      deletingId.value = null
    }
  }

  // ── Columns ──
  const columns: TableColumn<Category>[] = [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: '類別名稱' },
    { accessorKey: 'sortOrder', header: '排序', size: 80 },
    {
      id: 'actions',
      header: '',
      size: 100,
      cell: ({ row }) =>
        h('div', { class: 'flex items-center justify-end gap-1' }, [
          h(UButton, {
            icon: 'i-lucide-pencil',
            color: 'neutral',
            variant: 'ghost',
            size: 'sm',
            onClick: () => openEdit(row.original)
          }),
          h(UButton, {
            icon: 'i-lucide-trash-2',
            color: 'error',
            variant: 'ghost',
            size: 'sm',
            loading: deletingId.value === row.original.id,
            onClick: () => deleteCategory(row.original)
          })
        ])
    }
  ]
</script>
