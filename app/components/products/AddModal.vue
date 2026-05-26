<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const schema = z.object({
    name: z.string().min(1, '請輸入商品名稱'),
    category: z.string().min(1, '請輸入分類'),
    price: z.number({ error: '請輸入售價' }).positive('售價需大於 0'),
    stock: z.number({ error: '請輸入庫存' }).int().min(0, '庫存不可為負數'),
    status: z.enum(['active', 'draft', 'archived']),
    image: z.string().url('請輸入有效的圖片網址').optional().or(z.literal(''))
  })

  type Schema = z.output<typeof schema>

  const open = ref(false)
  const state = reactive<Partial<Schema>>({
    name: '',
    category: '',
    price: undefined,
    stock: undefined,
    status: 'draft',
    image: ''
  })

  const toast = useToast()

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    toast.add({ title: '新增成功', description: `商品「${event.data.name}」已新增`, color: 'success' })
    open.value = false
  }
</script>

<template>
  <UModal v-model:open="open" title="新增商品" description="填寫以下資訊以新增商品">
    <UButton label="新增商品" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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

        <UFormField label="圖片網址" name="image">
          <UInput v-model="state.image" placeholder="https://..." class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton label="取消" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="建立" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
