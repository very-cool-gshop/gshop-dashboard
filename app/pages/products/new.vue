<template>
  <UDashboardPanel id="products-new" :ui="{ body: 'lg:py-12' }">
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
      <UForm
        id="product-form"
        ref="productForm"
        :schema="schema"
        :state="state"
        class="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full max-w-3xl mx-auto"
        @submit="onSubmit"
      >
        <!-- ── 基本資料 ── -->
        <UPageCard
          title="基本資料"
          description="商品名稱、分類、售價與上架狀態。"
          variant="subtle"
        >
          <UFormField label="商品名稱" name="name" class="flex max-sm:flex-col justify-between items-start gap-4">
            <UInput v-model="state.name" placeholder="例：經典白 T-shirt" class="w-64" />
          </UFormField>

          <USeparator />

          <UFormField label="分類" name="categoryId" class="flex max-sm:flex-col justify-between items-start gap-4">
            <USelect
              v-model="state.categoryId"
              :items="categoryOptions"
              placeholder="請選擇分類"
              :loading="categoriesLoading"
              class="w-64"
            />
          </UFormField>

          <USeparator />

          <UFormField label="售價 (NT$)" name="price" class="flex max-sm:flex-col justify-between items-start gap-4">
            <UInput v-model.number="state.price" type="number" placeholder="0" class="w-64" />
          </UFormField>

          <USeparator />

          <UFormField label="狀態" name="status" class="flex max-sm:flex-col justify-between items-start gap-4">
            <USelect
              v-model="state.status"
              :items="[
                { label: '草稿', value: 'draft' },
                { label: '上架中', value: 'active' },
                { label: '已下架', value: 'archived' }
              ]"
              class="w-64"
            />
          </UFormField>

          <USeparator />

          <UFormField
            label="商品描述"
            name="description"
            description="描述商品特色、材質、尺寸等。"
            class="flex max-sm:flex-col justify-between items-start gap-4"
            :ui="{ container: 'w-full' }"
          >
            <UTextarea v-model="state.description" placeholder="描述商品特色、材質、尺寸等..." :rows="3" class="w-full" />
          </UFormField>
        </UPageCard>

        <!-- ── 商品圖片 ── -->
        <UPageCard
          title="商品圖片"
          description="建議使用正方形圖片以獲得最佳呈現效果。"
          variant="subtle"
        >
          <div class="space-y-3">
            <div
              class="flex items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
              :class="selectedImage ? 'border-(--ui-border)' : 'border-(--ui-border) hover:border-(--ui-border-accented)'"
              @click="imagePickerOpen = true"
            >
              <img v-if="selectedImage" :src="selectedImage.url" class="w-full h-full object-contain rounded-lg" />
              <div v-else class="flex flex-col items-center gap-2 text-(--ui-text-muted) select-none">
                <UIcon name="i-lucide-image-plus" class="w-10 h-10 opacity-50" />
                <span class="text-sm">點擊選擇圖片</span>
              </div>
            </div>
            <div v-if="selectedImage" class="flex gap-2">
              <UButton label="更換圖片" icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="sm" type="button" @click="imagePickerOpen = true" />
              <UButton label="移除" icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" type="button" @click="selectedImage = null" />
            </div>
          </div>
        </UPageCard>

        <ProductImagePickerModal v-model:open="imagePickerOpen" @select="selectedImage = $event" />

        <!-- ── 商品規格 ── -->
        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-semibold text-sm text-(--ui-text)">商品規格</p>
              </div>
              <UButton
                label="新增規格"
                icon="i-lucide-plus"
                color="neutral"
                variant="outline"
                size="sm"
                type="button"
                @click="addVariant"
              />
            </div>
          </template>

          <!-- 規格列表 -->
          <div v-if="variants.length > 0" class="divide-y divide-(--ui-border) border border-(--ui-border) rounded-lg overflow-hidden">
            <!-- Header -->
            <div class="flex gap-4 items-center px-4 py-2 bg-(--ui-bg-elevated)">
              <span class="w-16 shrink-0 text-xs font-medium text-(--ui-text)">圖片</span>
              <span class="flex-1 text-xs font-medium text-(--ui-text)">規格名稱</span>
              <span class="w-32 text-xs font-medium text-(--ui-text)">售價 (NT$)</span>
              <span class="w-28 text-xs font-medium text-(--ui-text)">庫存數量</span>
              <span class="w-8" />
            </div>

            <!-- 每列規格 -->
            <div
              v-for="(variant, index) in variants"
              :key="index"
              class="flex gap-4 items-center px-4 py-3"
            >
              <div class="w-16 shrink-0">
                <div
                  class="w-16 h-16 rounded-md border border-dashed border-(--ui-border) cursor-pointer flex items-center justify-center overflow-hidden hover:border-(--ui-border-accented) transition-colors"
                  @click="variantFileRefs[index]?.click()"
                >
                  <img v-if="variant.imagePreview" :src="variant.imagePreview" class="w-full h-full object-cover" />
                  <UIcon v-else name="i-lucide-image" class="w-4 h-4 text-(--ui-text-muted)" />
                </div>
                <input
                  :ref="el => { if (el) variantFileRefs[index] = el as HTMLInputElement }"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onVariantFileChange($event, index)"
                />
              </div>
              <UInput v-model="variant.name" placeholder="例：S / 紅色" class="flex-1" />
              <UInput v-model.number="variant.price" type="number" placeholder="0" class="w-32" />
              <UInput v-model.number="variant.stock" type="number" placeholder="0" class="w-28" />
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" type="button" class="w-8 shrink-0" @click="removeVariant(index)" />
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center gap-2 py-8 text-(--ui-text-muted)"
          >
            <UIcon name="i-lucide-layers" class="w-7 h-7 opacity-40" />
            <span class="text-sm">尚未新增任何規格</span>
          </div>
        </UPageCard>
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

  // ── 圖片 ──────────────────────────────────────────────
  interface ProductImage {
    id: number
    url: string
    filename: string
    size: number
  }

  const imagePickerOpen = ref(false)
  const selectedImage = ref<ProductImage | null>(null)

  // ── 規格 ──────────────────────────────────────────────
  interface VariantDraft {
    name: string
    price: number | null
    stock: number
    imageFile: File | null
    imagePreview: string | null
  }

  const productForm = useTemplateRef('productForm')
  const variants = ref<VariantDraft[]>([])
  const variantFileRefs = ref<HTMLInputElement[]>([])

  async function addVariant() {
    try {
      await productForm.value?.validate({ name: ['name', 'categoryId', 'price'] })
    } catch {
      return
    }
    variants.value.push({ name: '', price: null, stock: 0, imageFile: null, imagePreview: null })
  }

  function removeVariant(index: number) {
    variants.value.splice(index, 1)
  }

  function onVariantFileChange(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0]
    const variant = variants.value[index]
    if (!file || !variant) return
    variant.imageFile = file
    const reader = new FileReader()
    reader.onload = (e) => { variant.imagePreview = e.target?.result as string }
    reader.readAsDataURL(file)
  }

  // ── 分類 ──────────────────────────────────────────────
  interface Category {
    id: number
    name: string
  }

  const apiFetch = useApiFetch()
  const categoriesLoading = ref(false)
  const categoryOptions = ref<{ label: string; value: number }[]>([])

  onMounted(async () => {
    categoriesLoading.value = true
    try {
      const data = await apiFetch<Category[]>('/categories')
      categoryOptions.value = data.map(cat => ({ label: cat.name, value: cat.id }))
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
      const product = await apiFetch<{ id: number }>('/products', {
        method: 'POST',
        body: {
          name: event.data.name,
          categoryId: event.data.categoryId,
          description: event.data.description ?? '',
          price: event.data.price,
          status: event.data.status,
          imageIds: selectedImage.value ? [selectedImage.value.id] : []
        }
      })

      const validVariants = variants.value.filter(v => v.name.trim() && v.price !== null && v.price > 0)
      if (validVariants.length > 0) {
        await Promise.all(
          validVariants.map(v => {
            const variantFormData = new FormData()
            variantFormData.append('name', v.name.trim())
            variantFormData.append('price', String(v.price))
            variantFormData.append('stock', String(v.stock ?? 0))
            if (v.imageFile) variantFormData.append('image', v.imageFile)
            return apiFetch(`/products/${product.id}/variants`, { method: 'POST', body: variantFormData })
          })
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
