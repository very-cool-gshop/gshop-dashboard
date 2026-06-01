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
})
