import { login as loginApi, type User } from '~/api/auth'

export function useAuth() {
  const accessToken = useCookie('access_token')
  const refreshToken = useCookie('refresh_token')
  const user = useState<User | null>('auth:user', () => null)

  async function login(email: string, password: string) {
    const res = await loginApi(email, password)
    accessToken.value = res.accessToken
    refreshToken.value = res.refreshToken
    user.value = res.user
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    navigateTo('/login')
  }

  const isLoggedIn = computed(() => !!accessToken.value)

  return { user, isLoggedIn, login, logout }
}
