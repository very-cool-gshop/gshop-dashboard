<script setup lang="ts">
  import * as z from 'zod'
  import type { FormError } from '@nuxt/ui'

  const passwordSchema = z.object({
    current: z.string().min(8, '至少需要 8 個字元'),
    new: z.string().min(8, '至少需要 8 個字元')
  })

  type PasswordSchema = z.output<typeof passwordSchema>

  const password = reactive<Partial<PasswordSchema>>({
    current: '',
    new: ''
  })

  const validate = (state: Partial<PasswordSchema>): FormError[] => {
    const errors: FormError[] = []
    if (state.current && state.new && state.current === state.new) {
      errors.push({ name: 'new', message: '新密碼不能與舊密碼相同' })
    }
    return errors
  }
</script>

<template>
  <UPageCard title="密碼" description="設定新密碼前請先確認目前的密碼。" variant="subtle">
    <UForm :schema="passwordSchema" :state="password" :validate="validate" class="flex flex-col gap-4 max-w-xs">
      <UFormField name="current">
        <UInput v-model="password.current" type="password" placeholder="目前的密碼" class="w-full" />
      </UFormField>

      <UFormField name="new">
        <UInput v-model="password.new" type="password" placeholder="新密碼" class="w-full" />
      </UFormField>

      <UButton label="更新密碼" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="帳號"
    description="不再使用我們的服務？您可以在此刪除帳號。此操作無法復原，所有相關資料將被永久刪除。"
    class="bg-linear-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="刪除帳號" color="error" />
    </template>
  </UPageCard>
</template>
