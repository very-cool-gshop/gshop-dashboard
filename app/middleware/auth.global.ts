const VIEWER_BLOCKED = ['/products/new', '/settings']

export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user } = useGlobalState()

  if (!token.value) {
    if (to.path !== '/login') return navigateTo('/login')
    return
  }

  if (!user.value) {
    const { fetchMe } = await import('~/api/auth')
    try {
      await fetchMe()
    } catch {
      token.value = null
      if (to.path !== '/login') return navigateTo('/login')
    }
  }

  if (user.value?.role === 'viewer') {
    const isBlocked = VIEWER_BLOCKED.some(p => to.path.startsWith(p))
      || to.path.includes('/edit')
    if (isBlocked) {
      const toast = useToast()
      toast.add({
        title: '權限不足',
        description: '此帳號僅限瀏覽，無法執行此操作',
        color: 'error',
        icon: 'i-lucide-shield-x'
      })
      return navigateTo('/')
    }
  }
})
