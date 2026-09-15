import { NextRequest } from 'next/server'
import { json, preflight, fail } from '@/server/http'
import { listApprovedTeachers } from '@/server/services'

export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return preflight()
}

// 公开接口：已认证老师展示列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  try {
    const teachers = await listApprovedTeachers({
      instrument: searchParams.get('instrument') || '',
      city: searchParams.get('city') || '',
      q: (searchParams.get('q') || '').trim(),
    })
    return json({ teachers })
  } catch (error) {
    return fail(error, '获取认证老师列表失败', 'GET /api/teachers error:')
  }
}
