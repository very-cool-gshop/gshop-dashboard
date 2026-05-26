<template>
  <UDashboardPanel id="products-new">
    <template #header>
      <UDashboardNavbar title="新增商品">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton label="取消" color="neutral" variant="ghost" to="/products" />
          <UButton label="建立商品" icon="i-lucide-check" type="submit" form="product-form" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UForm id="product-form" :schema="schema" :state="state" class="max-w-2xl space-y-6" @submit="onSubmit">
        <UFormField label="商品名稱" name="name">
          <UInput v-model="state.name" placeholder="例：經典白 T-shirt" class="w-full" />
        </UFormField>

        <UFormField label="分類" name="category">
          <UInput v-model="state.category" placeholder="例：上衣" class="w-full" />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="售價 (NT$)" name="price">
            <UInput v-model.number="state.price" type="number" placeholder="0" class="w-full" />
          </UFormField>

          <UFormField label="庫存" name="stock">
            <UInput v-model.number="state.stock" type="number" placeholder="0" class="w-full" />
          </UFormField>
        </div>

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

        <UDivider label="規格" />

        <div class="space-y-3">
          <div
            v-for="(spec, index) in state.specs"
            :key="index"
            class="flex items-center gap-2"
          >
            <UInput v-model="spec.name" placeholder="規格名稱（例：尺寸）" class="w-1/3" />
            <UInput v-model="spec.value" placeholder="規格值（例：L）" class="flex-1" />
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" @click="removeSpec(index)" />
          </div>

          <UButton label="新增規格" icon="i-lucide-plus" color="neutral" variant="outline" size="sm" @click="addSpec" />
        </div>
      </UForm>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const schema = z.object({
    name: z.string().min(1, '請輸入商品名稱'),
    category: z.string().min(1, '請輸入分類'),
    price: z.number({ error: '請輸入售價' }).positive('售價需大於 0'),
    stock: z.number({ error: '請輸入庫存' }).int().min(0, '庫存不可為負數'),
    status: z.enum(['active', 'draft', 'archived']),
    image: z.string().optional(),
    specs: z.array(z.object({ name: z.string(), value: z.string() }))
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Partial<Schema>>({
    name: '',
    category: '',
    price: undefined,
    stock: undefined,
    status: 'draft',
    image: '',
    specs: []
  })

  const fileInputRef = ref<HTMLInputElement | null>(null)
  const imagePreview = ref<string | null>(null)

  function onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) loadPreview(file)
  }

  function onDrop(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) loadPreview(file)
  }

  function loadPreview(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
      state.image = imagePreview.value
    }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    imagePreview.value = null
    state.image = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
  }

  function addSpec() {
    state.specs!.push({ name: '', value: '' })
  }

  function removeSpec(index: number) {
    state.specs!.splice(index, 1)
  }

  const toast = useToast()

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    toast.add({ title: '新增成功', description: `商品「${event.data.name}」已建立`, color: 'success' })
    await navigateTo('/products')
  }
</script>
