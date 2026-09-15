import { z } from 'zod'
import { db } from './db'
import { signAdminToken } from './auth'
import { HttpError } from './http'
import { applySchema, trackPhoneSchema, REVIEW_STATUSES, type ApplyInput } from '@/lib/schemas'

/**
 * 业务服务层：全部业务逻辑集中于此，与 Web 框架（Next.js 路由）解耦。
 * 未来拆分独立后端服务时，本文件可整体迁移复用。
 */

const TEACHER_SELECT = {
  id: true,
  applyNo: true,
  name: true,
  gender: true,
  city: true,
  instrument: true,
  education: true,
  school: true,
  years: true,
  title: true,
  bio: true,
  achievement: true,
  reviewedAt: true,
} as const

function genApplyNo(): string {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MT${now.getFullYear()}${m}${d}-${rand}`
}

// ── 公开：认证老师列表（支持专业/城市/关键词筛选） ──
export async function listApprovedTeachers(filters: { instrument: string; city: string; q: string }) {
  const where: Record<string, unknown> = { status: 'APPROVED' }
  if (filters.instrument) where.instrument = filters.instrument
  if (filters.city) where.city = filters.city
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { school: { contains: filters.q } },
      { instrument: { contains: filters.q } },
      { city: { contains: filters.q } },
      { bio: { contains: filters.q } },
    ]
  }
  return db.teacherApplication.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    select: TEACHER_SELECT,
  })
}

// ── 公开：提交认证申请 ──
export async function submitApplication(raw: unknown) {
  const parsed = applySchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    throw new HttpError(400, first?.message || '提交信息不完整', {
      field: first?.path?.[0] ? String(first.path[0]) : undefined,
    })
  }
  const data: ApplyInput = parsed.data

  const existing = await db.teacherApplication.findFirst({
    where: { phone: data.phone, status: 'PENDING' },
  })
  if (existing) {
    throw new HttpError(409, `该手机号已有待审核的申请（编号 ${existing.applyNo}），请耐心等待审核结果`, {
      applyNo: existing.applyNo,
    })
  }

  const created = await db.teacherApplication.create({
    data: {
      applyNo: genApplyNo(),
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      email: data.email || null,
      city: data.city,
      instrument: data.instrument,
      education: data.education,
      school: data.school,
      years: data.years,
      title: data.title || null,
      bio: data.bio,
      achievement: data.achievement || null,
      status: 'PENDING',
    },
  })

  return {
    id: created.id,
    applyNo: created.applyNo,
    status: created.status,
    message: '申请已提交，评审团队将在 5 个工作日内完成审核',
  }
}

// ── 公开：按手机号查询审核进度（仅返回有限字段） ──
export async function trackApplication(phone: string) {
  const parsed = trackPhoneSchema.safeParse(phone)
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message || '请输入正确的11位手机号码')
  }
  const application = await db.teacherApplication.findFirst({
    where: { phone: parsed.data },
    orderBy: { createdAt: 'desc' },
    select: {
      applyNo: true,
      name: true,
      instrument: true,
      city: true,
      status: true,
      reviewNote: true,
      createdAt: true,
      reviewedAt: true,
    },
  })
  if (!application) {
    throw new HttpError(404, '未查询到该手机号的认证申请记录')
  }
  return application
}

// ── 公开：官网统计数据 ──
export async function getPublicStats() {
  const approved = await db.teacherApplication.findMany({
    where: { status: 'APPROVED' },
    select: { city: true, instrument: true, reviewedAt: true },
  })
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  return {
    approvedCount: approved.length,
    cityCount: new Set(approved.map((t) => t.city)).size,
    instrumentCount: new Set(approved.map((t) => t.instrument)).size,
    monthlyNew: approved.filter((t) => t.reviewedAt && t.reviewedAt >= monthStart).length,
  }
}

// ── 管理端：登录 ──
export async function adminLogin(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  const expectedPassword = process.env.ADMIN_PASSWORD || 'verify@2026'
  if (username !== expectedUsername || password !== expectedPassword) {
    throw new HttpError(401, '用户名或密码错误')
  }
  const token = await signAdminToken({ role: 'admin', username })
  return { token, user: { username, role: 'admin' as const } }
}

// ── 管理端：申请列表 ──
export async function adminListApplications(status: string) {
  const where: Record<string, unknown> = {}
  if ((REVIEW_STATUSES as readonly string[]).includes(status)) {
    where.status = status
  }
  return db.teacherApplication.findMany({ where, orderBy: [{ createdAt: 'desc' }] })
}

// ── 管理端：审核（通过/驳回） ──
export async function decideApplication(id: string, status: string, reviewNote: string) {
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    throw new HttpError(400, '无效的审核操作')
  }
  if (status === 'REJECTED' && reviewNote.length < 4) {
    throw new HttpError(400, '驳回时请填写审核意见（至少4个字）')
  }
  const existing = await db.teacherApplication.findUnique({ where: { id } })
  if (!existing) {
    throw new HttpError(404, '申请不存在')
  }
  const updated = await db.teacherApplication.update({
    where: { id },
    data: { status, reviewNote: reviewNote || null, reviewedAt: new Date() },
  })
  return { application: updated }
}
