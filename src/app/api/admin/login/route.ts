import { NextRequest } from 'next/server'
import { json, preflight, fail } from '@/server/http'
import { adminLogin } from '@/server/services'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 管理员登录：返回 Bearer Token（前端持久化到 localStorage）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const username = String(body?.username || '').trim()
    const password = String(body?.password || '')
    return json(await adminLogin(username, password))
  } catch (error) {
    return fail(error, '登录失败，请稍后重试', 'POST /api/admin/login error:')
  }
}
