<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { fetchMe } from '~/api/auth'

  const profileSchema = z.object({
    name: z.string().min(2, 'Too short'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional()
  })

  type ProfileSchema = z.output<typeof profileSchema>

  const { user } = useGlobalState()

  const profile = reactive<Partial<ProfileSchema>>({
    name: user.value?.name,
    email: user.value?.email,
    phone: user.value?.phone || undefined,
    address: user.value?.address || undefined,
    avatar: user.value?.avatar || undefined
  })

  onMounted(async () => {
    await fetchMe()
    profile.name = user.value?.name
    profile.email = user.value?.email
    profile.phone = user.value?.phone || undefined
    profile.address = user.value?.address || undefined
    profile.avatar = user.value?.avatar || undefined
  })
  const toast = useToast()
  async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
    toast.add({
      title: '儲存成功',
      description: '設定已更新。',
      icon: 'i-lucide-check',
      color: 'success'
    })
    console.log(event.data)
  }


</script>

<template>
  <UForm id="settings" :schema="profileSchema" :state="profile" @submit="onSubmit">
    <UPageCard
      title="個人資料"
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton form="settings" label="儲存變更" color="neutral" type="submit" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="avatar"
        label="頭像"
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <UAvatar :src="profile.avatar" :alt="profile.name" size="lg" />
      </UFormField>
      <USeparator />
      <UFormField
        name="name"
        label="姓名"
        required
        class="flex max-sm:flex-col justify-between items-center gap-4"
      >
        <UInput v-model="profile.name" autocomplete="off" class="w-72" />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="信箱"
        required
        class="flex max-sm:flex-col justify-between items-center gap-4"
      >
        <UInput v-model="profile.email" type="email" disabled class="w-72" />
      </UFormField>
      <USeparator />
      <UFormField
        name="phone"
        label="電話"
        class="flex max-sm:flex-col justify-between items-center gap-4"
      >
        <UInput v-model="profile.phone" type="tel" autocomplete="off" class="w-72" />
      </UFormField>
      <USeparator />
      <UFormField
        name="address"
        label="地址"
        class="flex max-sm:flex-col justify-between items-center gap-4"
      >
        <UInput v-model="profile.address" autocomplete="off" class="w-72" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
