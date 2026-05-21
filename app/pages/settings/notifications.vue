<script setup lang="ts">
  const state = reactive<{ [key: string]: boolean }>({
    email: true,
    desktop: false,
    product_updates: true,
    weekly_digest: false,
    important_updates: true
  })

  const sections = [
    {
      title: '通知管道',
      description: '您希望如何接收通知？',
      fields: [
        {
          name: 'email',
          label: 'Email',
          description: '每日接收 Email 摘要通知。'
        },
        {
          name: 'desktop',
          label: '桌面通知',
          description: '接收桌面推播通知。'
        }
      ]
    },
    {
      title: '帳號更新',
      description: '接收產品相關通知。',
      fields: [
        {
          name: 'weekly_digest',
          label: '每週摘要',
          description: '每週接收一次新聞摘要。'
        },
        {
          name: 'product_updates',
          label: '產品更新',
          description: '每月接收新功能與更新通知。'
        },
        {
          name: 'important_updates',
          label: '重要更新',
          description: '接收安全性修補、維護等重要通知。'
        }
      ]
    }
  ]

  async function onChange() {
    // Do something with data
    console.log(state)
  }
</script>

<template>
  <div v-for="(section, index) in sections" :key="index">
    <UPageCard :title="section.title" :description="section.description" variant="naked" class="mb-4" />

    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-default' }">
      <UFormField
        v-for="field in section.fields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :description="field.description"
        class="flex items-center justify-between not-last:pb-4 gap-2"
      >
        <USwitch v-model="state[field.name]" @update:model-value="onChange" />
      </UFormField>
    </UPageCard>
  </div>
</template>
