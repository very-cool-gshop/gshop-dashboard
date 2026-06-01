export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  token: string
  user: User
}

export async function fetchMe() {
  const { public: { apiBase } } = useRuntimeConfig()
  const { token, user } = useGlobalState()

  const res = await $fetch<User>(`${apiBase}/auth/me`, {
    headers: { Authorization: `Bearer ${token.value}` }
  })
  user.value = res
}

export async function login(email: string, password: string) {
  const { public: { apiBase } } = useRuntimeConfig()
  const { token, user } = useGlobalState()

  const res = await $fetch<LoginResponse>(`${apiBase}/auth/login`, {
    method: 'POST',
    body: { email, password }
  })
  token.value = res.token
  user.value = res.user
}

export function logout() {
  const { token, user } = useGlobalState()
  token.value = null
  user.value = null
  navigateTo('/login')
}
