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

      <UButton type="submit" class="w-full justify-center mt-4 cursor-pointer" :loading="loading"> 登入 </UButton>
    </UForm>

    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-[var(--ui-border)]" />
      <span class="text-xs text-muted">或</span>
      <div class="flex-1 h-px bg-[var(--ui-border)]" />
    </div>

    <div class="flex flex-col gap-2">
      <UButton variant="outline" class="w-full justify-center cursor-pointer" :loading="viewerLoading" @click="loginAsViewer">
        訪客登入
      </UButton>
      <p class="text-xs text-muted text-center">僅供瀏覽，無法編輯資料</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { login } from '~/api/auth'

  definePageMeta({ layout: 'auth' })

  const toast = useToast()

  const state = reactive({
    email: '',
    password: ''
  })

  const loading = ref(false)
  const viewerLoading = ref(false)

  async function loginAsViewer() {
    viewerLoading.value = true
    try {
      await login('demouser@gmail.com', 'demo1234')
      toast.add({ title: '登入成功', color: 'success' })
      await navigateTo('/')
    } catch (error: any) {
      const message = error?.data?.message || '登入失敗'
      toast.add({ title: '登入失敗', description: message, color: 'error' })
    } finally {
      viewerLoading.value = false
    }
  }

  async function onSubmit() {
    loading.value = true
    try {
      await login(state.email, state.password)
      toast.add({ title: '登入成功', color: 'success' })
      await navigateTo('/')
    } catch (error: any) {
      const message = error?.data?.message || '登入失敗'
      toast.add({ title: '登入失敗', description: message, color: 'error' })
    } finally {
      loading.value = false
    }
  }
</script>
