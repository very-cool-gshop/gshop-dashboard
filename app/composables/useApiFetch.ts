export function useApiFetch() {
  const { public: { apiBase } } = useRuntimeConfig()
  const { token, user } = useGlobalState()

  async function apiFetch<T>(url: string, options: Record<string, any> = {}): Promise<T> {
    try {
      return await $fetch<T>(url, {
        baseURL: apiBase,
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
        }
      }) as T
    } catch (error: any) {
      if (error?.response?.status === 401) {
        token.value = null
        user.value = null
        await navigateTo('/login')
      }
      throw error
    }
  }

  return apiFetch
}
