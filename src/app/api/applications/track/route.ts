import { NextRequest } from 'next/server'
import { json, preflight, fail } from '@/server/http'
import { trackApplication } from '@/server/services'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 公开接口：按手机号查询最新申请进度
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  try {
    const application = await trackApplication((searchParams.get('phone') || '').trim())
    return json({ application })
  } catch (error) {
    return fail(error, '查询失败，请稍后重试', 'GET /api/applications/track error:')
  }
}
