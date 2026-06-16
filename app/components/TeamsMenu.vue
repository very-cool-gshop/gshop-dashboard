<script setup lang="ts">
  defineProps<{
    collapsed?: boolean
  }>()

  const team = {
    label: 'GShop',
    avatar: {
      src: 'https://github.com/nuxt.png',
      alt: 'GShop'
    }
  }
</script>

<template>
  <UButton
    v-bind="{
      ...team,
      label: collapsed ? undefined : team.label
    }"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    :class="[!collapsed && 'py-2 justify-start hover:bg-transparent cursor-default']"
  />
</template>
