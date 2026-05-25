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
  accessToken: string
  refreshToken: string
  user: User
}

export function login(email: string, password: string) {
  const { public: { apiBase } } = useRuntimeConfig()
  return $fetch<LoginResponse>(`${apiBase}/auth/login`, {
    method: 'POST',
    body: { email, password }
  })
}

export function refresh(token: string) {
  const { public: { apiBase } } = useRuntimeConfig()
  return $fetch<{ accessToken: string; refreshToken?: string }>(`${apiBase}/auth/refresh`, {
    method: 'POST',
    body: { refreshToken: token }
  })
}
