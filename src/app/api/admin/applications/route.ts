import { NextRequest } from 'next/server'
import { json, preflight, fail, HttpError } from '@/server/http'
import { adminListApplications } from '@/server/services'
import { getAdminFromRequest } from '@/server/auth'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 管理端：查看全部申请（需 Bearer Token）
export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return json({ error: '未登录或登录已过期' }, 401)

  const { searchParams } = new URL(request.url)
  try {
    const applications = await adminListApplications(searchParams.get('status') || '')
    return json({ applications })
  } catch (error) {
    return fail(error, '获取申请列表失败', 'GET /api/admin/applications error:')
  }
}
