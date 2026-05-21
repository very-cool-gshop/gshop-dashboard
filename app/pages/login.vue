<script setup lang="ts">
  definePageMeta({ layout: 'auth' })

  const toast = useToast()

  const state = reactive({
    email: '',
    password: ''
  })

  const loading = ref(false)

  async function onSubmit() {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 800))
    loading.value = false

    toast.add({ title: '登入成功', color: 'success' })
    await navigateTo('/')
  }
</script>

<template>
  <UCard class="w-full max-w-sm mb-5">
    <template #header>
      <div class="flex flex-col items-center gap-1 py-2">
        <p class="text-2xl font-bold text-highlighted">登入</p>
        <p class="text-sm text-muted">歡迎回來</p>
      </div>
    </template>

    <UForm :state="state" class="flex flex-col gap-4" @submit="onSubmit">
      <UFormField label="電子郵件" name="email">
        <UInput v-model="state.email" type="email" placeholder="you@example.com" autocomplete="email" class="w-full" />
      </UFormField>

      <UFormField label="密碼" name="password">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" class="w-full justify-center" :loading="loading"> 登入 </UButton>
    </UForm>
  </UCard>
</template>
