import { json, preflight, fail } from '@/server/http'
import { getPublicStats } from '@/server/services'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 公开接口：官网统计数据
export async function GET() {
  try {
    return json(await getPublicStats())
  } catch (error) {
    return fail(error, '获取统计数据失败', 'GET /api/stats error:')
  }
}
