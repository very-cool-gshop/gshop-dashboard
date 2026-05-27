<template>
  <UDashboardPanel id="products-new" :ui="{ body: 'sm:p-6 lg:py-8' }">
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
      <div class="w-full max-w-3xl mx-auto">
      <UForm id="product-form" :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
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

        <!-- 商品規格 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-(--ui-text)">商品規格</p>
              <p class="text-xs text-(--ui-text-muted)">可為同一商品設定多種尺寸、顏色等規格</p>
            </div>
            <UButton
              label="新增規格"
              icon="i-lucide-plus"
              color="neutral"
              variant="outline"
              size="sm"
              @click="addVariant"
            />
          </div>

          <!-- 規格列表 -->
          <div v-if="variants.length > 0" class="space-y-3">
            <div
              v-for="(variant, index) in variants"
              :key="index"
              class="grid grid-cols-[1fr_auto] gap-3 p-4 border rounded-lg border-(--ui-border) bg-(--ui-bg-elevated)/40"
            >
              <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                <UFormField label="規格名稱">
                  <UInput
                    v-model="variant.name"
                    placeholder="例：S / 紅色"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="售價 (NT$)">
                  <UInput
                    v-model.number="variant.price"
                    type="number"
                    placeholder="0"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="庫存數量">
                  <UInput
                    v-model.number="variant.stock"
                    type="number"
                    placeholder="0"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="規格圖片網址（選填）">
                  <UInput
                    v-model="variant.imageUrl"
                    placeholder="https://..."
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="flex items-start pt-6">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="removeVariant(index)"
                />
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center gap-2 py-6 border border-dashed rounded-lg border-(--ui-border) text-(--ui-text-muted)"
          >
            <UIcon name="i-lucide-layers" class="w-7 h-7 opacity-40" />
            <span class="text-sm">尚未新增任何規格</span>
          </div>
        </div>
      </UForm>
      </div>
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

  // ── 圖片 ──────────────────────────────────────────────
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

  // ── 規格 ──────────────────────────────────────────────
  interface VariantDraft {
    name: string
    price: number | null
    stock: number
    imageUrl: string
  }

  const variants = ref<VariantDraft[]>([])

  function addVariant() {
    variants.value.push({ name: '', price: null, stock: 0, imageUrl: '' })
  }

  function removeVariant(index: number) {
    variants.value.splice(index, 1)
  }

  // ── 分類 ──────────────────────────────────────────────
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

  // ── 送出 ──────────────────────────────────────────────
  const toast = useToast()
  const loading = ref(false)

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
      // 1. 建立商品
      const fd = new FormData()
      fd.append('name', event.data.name)
      fd.append('categoryId', String(event.data.categoryId))
      fd.append('description', event.data.description ?? '')
      fd.append('price', String(event.data.price))
      fd.append('status', event.data.status)
      if (imageFile.value) fd.append('image', imageFile.value)

      const product = await apiFetch<{ id: number }>('/products', { method: 'POST', body: fd })

      // 2. 批次建立規格（跳過名稱或售價未填的列）
      const validVariants = variants.value.filter(v => v.name.trim() && v.price !== null && v.price > 0)
      if (validVariants.length > 0) {
        await Promise.all(
          validVariants.map(v =>
            apiFetch(`/products/${product.id}/variants`, {
              method: 'POST',
              body: {
                name: v.name.trim(),
                price: v.price,
                stock: v.stock ?? 0,
                ...(v.imageUrl.trim() ? { imageUrl: v.imageUrl.trim() } : {})
              }
            })
          )
        )
      }

      toast.add({
        title: '新增成功',
        description: `商品「${event.data.name}」已建立${validVariants.length > 0 ? `，共 ${validVariants.length} 筆規格` : ''}`,
        color: 'success'
      })
      await navigateTo('/products')
    } catch {
      toast.add({ title: '新增失敗', description: '請稍後再試', color: 'error' })
    } finally {
      loading.value = false
    }
  }
</script>
