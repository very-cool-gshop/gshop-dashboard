<template>
  <UModal v-model:open="open" title="新增客戶" description="將新客戶加入資料庫">
    <UButton label="新增客戶" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="姓名" placeholder="王小明" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Email" placeholder="example@email.com" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="取消" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="建立" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const schema = z.object({
    name: z.string().min(2, '名稱太短'),
    email: z.string().email('Email 格式不正確')
  })
  const open = ref(false)

  type Schema = z.output<typeof schema>

  const state = reactive<Partial<Schema>>({
    name: '',
    email: ''
  })

  const toast = useToast()
  async function onSubmit(event: FormSubmitEvent<Schema>) {
    toast.add({ title: '新增成功', description: `新客戶 ${event.data.name} 已新增`, color: 'success' })
    open.value = false
  }
</script>
