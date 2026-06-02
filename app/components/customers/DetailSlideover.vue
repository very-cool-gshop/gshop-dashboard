<template>
  <USlideover v-model:open="open" title="客戶詳情">
    <template #body>
      <div v-if="status === 'pending'" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-muted size-6" />
      </div>

      <div v-else-if="user" class="space-y-6">
        <div class="flex items-center gap-4">
          <UAvatar :src="user.avatar ?? undefined" size="xl" />
          <div>
            <p class="text-lg font-semibold text-highlighted">{{ user.name }}</p>
            <UBadge :color="user.role === 'admin' ? 'primary' : 'neutral'" variant="subtle" class="capitalize mt-1">
              {{ user.role }}
            </UBadge>
          </div>
        </div>

        <UDivider />

        <dl class="space-y-4">
          <div class="flex justify-between gap-4">
            <dt class="text-sm text-muted shrink-0">ID</dt>
            <dd class="text-sm font-medium text-right">{{ user.id }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-sm text-muted shrink-0">Email</dt>
            <dd class="text-sm font-medium text-right break-all">{{ user.email }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-sm text-muted shrink-0">電話</dt>
            <dd class="text-sm font-medium text-right">{{ user.phone ?? '-' }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-sm text-muted shrink-0">建立時間</dt>
            <dd class="text-sm font-medium text-right">{{ formatDate(user.createdAt) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-sm text-muted shrink-0">更新時間</dt>
            <dd class="text-sm font-medium text-right">{{ formatDate(user.updatedAt) }}</dd>
          </div>
        </dl>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
  import type { User } from '~/types'

  const props = defineProps<{
    userId: number | null
  }>()

  const open = defineModel<boolean>('open', { required: true })

  const apiFetch = useApiFetch()
  const user = ref<User | null>(null)
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

  watch(
    () => props.userId,
    async (id) => {
      if (!id) return
      status.value = 'pending'
      try {
        user.value = await apiFetch<User>(`/users/${id}`)
        status.value = 'success'
      } catch {
        status.value = 'error'
      }
    }
  )

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>
