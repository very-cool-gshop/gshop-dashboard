<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const route = useRoute()
  const toast = useToast()

  const open = ref(false)

  const links = [
    [
      {
        label: '首頁',
        icon: 'i-lucide-house',
        to: '/',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: '收件匣',
        icon: 'i-lucide-inbox',
        to: '/inbox',
        badge: '4',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: '客戶管理',
        icon: 'i-lucide-users',
        to: '/customers',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: '商品管理',
        icon: 'i-lucide-package',
        to: '/products',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: '商品類別',
        icon: 'i-lucide-tag',
        to: '/categories',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: '訂單管理',
        icon: 'i-lucide-shopping-bag',
        to: '/orders',
        onSelect: () => {
          open.value = false
        }
      },
      {
        label: '設定',
        to: '/settings',
        icon: 'i-lucide-settings',
        defaultOpen: true,
        type: 'trigger',
        children: [
          {
            label: '一般',
            to: '/settings',
            exact: true,
            onSelect: () => {
              open.value = false
            }
          },
          {
            label: '成員',
            to: '/settings/members',
            onSelect: () => {
              open.value = false
            }
          },
          {
            label: '通知',
            to: '/settings/notifications',
            onSelect: () => {
              open.value = false
            }
          },
          {
            label: '安全性',
            to: '/settings/security',
            onSelect: () => {
              open.value = false
            }
          }
        ]
      }
    ]
  ] satisfies NavigationMenuItem[][]

  const groups = computed(() => [
    {
      id: 'links',
      label: '前往',
      items: links.flat()
    },
    {
      id: 'code',
      label: '程式碼',
      items: [
        {
          id: 'source',
          label: '查看頁面原始碼',
          icon: 'i-simple-icons-github',
          to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === '/' ? '/index' : route.path}.vue`,
          target: '_blank'
        }
      ]
    }
  ])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu :collapsed="collapsed" :items="links[0]" orientation="vertical" tooltip popover />

        <UNavigationMenu :collapsed="collapsed" :items="links[1]" orientation="vertical" tooltip class="mt-auto" />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
