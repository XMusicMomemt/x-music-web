'use client'

// 独立部署后端时，构建期注入 NEXT_PUBLIC_API_BASE_URL（如 https://api.xxx.com），留空则同源访问
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

const TOKEN_KEY = 'mt_admin_token'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

interface FetchOptions extends RequestInit {
  auth?: boolean
}

// 统一的请求封装：自动携带管理端 Bearer Token
export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { auth, headers, ...rest } = options
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  }
  if (rest.body && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getAdminToken()
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${url}`, { ...rest, headers: finalHeaders })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error((data as { error?: string }).error || `请求失败（${res.status}）`)
    err.name = res.status === 401 ? 'Unauthorized' : 'ApiError'
    throw err
  }
  return data as T
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
