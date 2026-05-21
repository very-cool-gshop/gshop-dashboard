<script setup lang="ts">
  import * as z from 'zod'
  import type { FormSubmitEvent } from '@nuxt/ui'

  const fileRef = ref<HTMLInputElement>()

  const profileSchema = z.object({
    name: z.string().min(2, 'Too short'),
    email: z.string().email('Invalid email'),
    username: z.string().min(2, 'Too short'),
    avatar: z.string().optional(),
    bio: z.string().optional()
  })

  type ProfileSchema = z.output<typeof profileSchema>

  const profile = reactive<Partial<ProfileSchema>>({
    name: 'Benjamin Canac',
    email: 'ben@nuxtlabs.com',
    username: 'benjamincanac',
    avatar: undefined,
    bio: undefined
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

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement

    if (!input.files?.length) {
      return
    }

    profile.avatar = URL.createObjectURL(input.files[0]!)
  }

  function onFileClick() {
    fileRef.value?.click()
  }
</script>

<template>
  <UForm id="settings" :schema="profileSchema" :state="profile" @submit="onSubmit">
    <UPageCard
      title="個人資料"
      description="這些資訊將公開顯示。"
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton form="settings" label="儲存變更" color="neutral" type="submit" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="姓名"
        description="將顯示在收據、發票及相關通知中。"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.name" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        label="Email"
        description="用於登入、收取收據及產品更新通知。"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.email" type="email" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        label="使用者名稱"
        description="用於登入及個人頁面網址的唯一名稱。"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput v-model="profile.username" type="username" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        label="頭像"
        description="JPG、GIF 或 PNG，最大 1MB。"
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="profile.avatar" :alt="profile.name" size="lg" />
          <UButton label="選擇圖片" color="neutral" @click="onFileClick" />
          <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange" />
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="個人簡介"
        description="簡短介紹自己，支援超連結。"
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea v-model="profile.bio" :rows="5" autoresize class="w-full" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
