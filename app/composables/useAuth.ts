import { login as loginApi, type User } from '~/api/auth'

export function useAuth() {
  const token = useCookie('token')
  const user = useState<User | null>('auth:user', () => null)

  async function login(email: string, password: string) {
    const res = await loginApi(email, password)
    token.value = res.token
    user.value = res.user
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const isLoggedIn = computed(() => !!token.value)

  return { user, isLoggedIn, login, logout }
}
