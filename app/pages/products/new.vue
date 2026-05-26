<template>
  <UDashboardPanel id="products-new">
    <template #header>
      <UDashboardNavbar title="新增商品">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="取消" color="neutral" variant="ghost" to="/products" />
          <UButton label="建立商品" icon="i-lucide-check" type="submit" form="product-form" :loading="loading" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UForm id="product-form" :schema="schema" :state="state" class="max-w-2xl space-y-6" @submit="onSubmit">
        <UFormField label="商品名稱" name="name">
          <UInput v-model="state.name" placeholder="例：經典白 T-shirt" class="w-full" />
        </UFormField>

        <UFormField label="分類" name="categoryId">
          <USelect
            v-model="state.categoryId"
            :items="categoryOptions"
            placeholder="請選擇分類"
            :loading="categoriesLoading"
            class="w-full"
          />
        </UFormField>

        <UFormField label="商品描述" name="description">
          <UTextarea v-model="state.description" placeholder="描述商品特色、材質、尺寸等..." :rows="3" class="w-full" />
        </UFormField>

        <UFormField label="售價 (NT$)" name="price">
          <UInput v-model.number="state.price" type="number" placeholder="0" class="w-full" />
        </UFormField>

        <UFormField label="狀態" name="status">
          <USelect
            v-model="state.status"
            :items="[
              { label: '草稿', value: 'draft' },
              { label: '上架中', value: 'active' },
              { label: '已下架', value: 'archived' }
            ]"
            class="w-full"
          />
        </UFormField>

        <UFormField label="商品圖片" name="image">
          <div class="space-y-3">
            <div
              class="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
              :class="imagePreview ? 'border-(--ui-border)' : 'border-(--ui-border) hover:border-(--ui-border-accented) bg-transparent'"
              @click="fileInputRef?.click()"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-contain rounded-lg" />
              <div v-else class="flex flex-col items-center gap-2 text-gray-400 select-none">
                <UIcon name="i-lucide-image-plus" class="w-10 h-10" />
                <span class="text-sm">點擊或拖曳圖片至此上傳</span>
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <div v-if="imagePreview" class="flex gap-2">
              <UButton label="更換圖片" icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="sm" @click="fileInputRef?.click()" />
              <UButton label="移除" icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" @click="removeImage" />
            </div>
          </div>
        </UFormField>
      </UForm>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const schema = z.object({
    name: z.string().min(1, '請輸入商品名稱'),
    categoryId: z.number({ error: '請選擇種類' }).int().positive('請輸入有效的分類 ID'),
    description: z.string().optional(),
    price: z.number({ error: '請輸入售價' }).positive('售價需大於 0'),
    status: z.enum(['active', 'draft', 'archived'])
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Partial<Schema>>({
    name: '',
    categoryId: undefined,
    description: '',
    price: undefined,
    status: 'draft'
  })

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const imagePreview = ref<string | null>(null)
  const imageFile = ref<File | null>(null)

  function onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) loadPreview(file)
  }

  function onDrop(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) loadPreview(file)
  }

  function loadPreview(file: File) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => { imagePreview.value = e.target?.result as string }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    imagePreview.value = null
    imageFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  }

  interface Category {
    id: number
    name: string
    children?: Category[]
  }

  const apiFetch = useApiFetch()

  const categoriesLoading = ref(false)
  const categoryOptions = ref<{ label: string; value: number }[]>([])

  onMounted(async () => {
    categoriesLoading.value = true
    try {
      const data = await apiFetch<Category[]>('/categories')
      categoryOptions.value = data.flatMap(cat => [
        { label: cat.name, value: cat.id },
        ...(cat.children ?? []).map(child => ({ label: `　${child.name}`, value: child.id }))
      ])
    } finally {
      categoriesLoading.value = false
    }
  })

  const toast = useToast()
  const loading = ref(false)

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
      const fd = new FormData()
      fd.append('name', event.data.name)
      fd.append('categoryId', String(event.data.categoryId))
      fd.append('description', event.data.description ?? '')
      fd.append('price', String(event.data.price))
      fd.append('status', event.data.status)
      if (imageFile.value) fd.append('image', imageFile.value)

      await apiFetch('/products', { method: 'POST', body: fd })
      toast.add({ title: '新增成功', description: `商品「${event.data.name}」已建立`, color: 'success' })
      await navigateTo('/products')
    } catch {
      toast.add({ title: '新增失敗', description: '請稍後再試', color: 'error' })
    } finally {
      loading.value = false
    }
  }
</script>
