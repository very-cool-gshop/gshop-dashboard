export function useGlobalState() {
  const token = useCookie('token')
  const user = useState('user')
  const isLoggedIn = computed(() => !!token.value)

  return { token, user, isLoggedIn }
}
