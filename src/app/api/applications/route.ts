import { NextRequest } from 'next/server'
import { json, preflight, fail } from '@/server/http'
import { submitApplication } from '@/server/services'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 公开接口：提交认证申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return json({ error: '请求体格式错误' }, 400)
    const result = await submitApplication(body)
    return json(result, 201)
  } catch (error) {
    return fail(error, '提交失败，请稍后重试', 'POST /api/applications error:')
  }
}
