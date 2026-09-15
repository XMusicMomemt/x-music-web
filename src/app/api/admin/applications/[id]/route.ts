import { NextRequest } from 'next/server'
import { json, preflight, fail } from '@/server/http'
import { decideApplication } from '@/server/services'
import { getAdminFromRequest } from '@/server/auth'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 管理端：审核申请（通过 / 驳回，可附审核意见）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return json({ error: '未登录或登录已过期' }, 401)

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const result = await decideApplication(id, String(body?.status || ''), String(body?.reviewNote || '').trim())
    return json(result)
  } catch (error) {
    return fail(error, '审核操作失败，请稍后重试', 'PATCH /api/admin/applications/[id] error:')
  }
}
