import { z } from 'zod'

/**
 * 共享校验层：前端表单与服务端 API 使用同一份 zod schema，
 * 保证两端校验规则与提示文案永远一致（如「请选择性别」）。
 * 本文件保持纯净：只依赖 zod，禁止引入 db / server 代码。
 */

export const applySchema = z.object({
  name: z.string().trim().min(2, '请填写真实姓名（至少2个字）').max(20, '姓名过长'),
  gender: z.enum(['男', '女'], { error: '请选择性别' }),
  phone: z.string().regex(/^1\d{10}$/, '请填写11位手机号码'),
  email: z.string().trim().email('邮箱格式不正确').optional().or(z.literal('')),
  city: z.string().min(1, '请选择所在城市'),
  instrument: z.string().min(1, '请选择专业方向'),
  education: z.string().min(1, '请选择最高学历'),
  school: z.string().trim().min(2, '请填写毕业院校').max(40, '院校名称过长'),
  years: z
    .number({ message: '请填写教学年限' })
    .int('教学年限须为整数')
    .min(0, '教学年限不合法')
    .max(60, '教学年限不合法'),
  title: z.string().trim().max(30, '职称过长').optional().or(z.literal('')),
  bio: z
    .string()
    .trim()
    .min(20, '个人简介至少20字，帮助评审了解您的教学特色')
    .max(600, '个人简介最多600字'),
  achievement: z.string().trim().max(600, '获奖与成就最多600字').optional().or(z.literal('')),
})

export type ApplyInput = z.infer<typeof applySchema>

export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const

export const trackPhoneSchema = z
  .string()
  .regex(/^1\d{10}$/, '请输入正确的11位手机号码')
