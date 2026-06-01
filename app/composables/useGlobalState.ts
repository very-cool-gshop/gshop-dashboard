import { login as loginApi, type User } from '~/api/auth'

export function useGlobalState() {
  const token = useCookie('token')
  const user = useState<User | null>('auth:user', () => null)
  const isLoggedIn = computed(() => !!token.value)

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

  return { token, user, isLoggedIn, login, logout }
}
