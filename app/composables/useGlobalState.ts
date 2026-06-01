import type { User } from '~/api/auth'

export function useGlobalState() {
  const token = useCookie('token')
  const user = useState<User | null>('user', () => null)
  const isLoggedIn = computed(() => !!token.value)

  return { token, user, isLoggedIn }
}
