import { refresh } from '~/api/auth'

export function useApiFetch() {
  const { public: { apiBase } } = useRuntimeConfig()
  const accessToken = useCookie('access_token')
  const refreshToken = useCookie('refresh_token')
  const user = useState('auth:user')

  async function apiFetch<T>(url: string, options: Record<string, any> = {}): Promise<T> {
    const buildHeaders = (token: string | null | undefined) => ({
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    })

    try {
      return await $fetch<T>(url, {
        baseURL: apiBase,
        ...options,
        headers: buildHeaders(accessToken.value)
      }) as T
    } catch (error: any) {
      if (error?.response?.status !== 401) throw error

      try {
        const res = await refresh(refreshToken.value!)
        accessToken.value = res.accessToken
        if (res.refreshToken) refreshToken.value = res.refreshToken

        return await $fetch<T>(url, {
          baseURL: apiBase,
          ...options,
          headers: buildHeaders(res.accessToken)
        }) as T
      } catch {
        accessToken.value = null
        refreshToken.value = null
        user.value = null
        await navigateTo('/login')
        throw error
      }
    }
  }

  return apiFetch
}
