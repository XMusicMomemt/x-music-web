// 全站共享的常量与工具（前后端通用）

export const INSTRUMENTS = [
  '钢琴',
  '声乐',
  '小提琴',
  '古筝',
  '吉他',
  '架子鼓',
  '长笛',
  '萨克斯',
  '大提琴',
  '琵琶',
] as const

export const CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '南京',
  '武汉',
  '西安',
  '重庆',
] as const

export const EDUCATIONS = ['大专', '本科', '硕士', '博士'] as const

export const GENDERS = ['男', '女'] as const

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export const STATUS_LABEL: Record<string, string> = {
  PENDING: '审核中',
  APPROVED: '已认证',
  REJECTED: '未通过',
}

// 头像渐变色（按专业方向固定映射，避免蓝/靛色系）
export const INSTRUMENT_GRADIENT: Record<string, string> = {
  钢琴: 'from-amber-600 to-yellow-800',
  声乐: 'from-rose-600 to-rose-900',
  小提琴: 'from-teal-600 to-emerald-900',
  古筝: 'from-purple-600 to-fuchsia-900',
  吉他: 'from-green-600 to-teal-900',
  架子鼓: 'from-stone-500 to-stone-800',
  长笛: 'from-cyan-600 to-teal-900',
  萨克斯: 'from-orange-600 to-red-900',
  大提琴: 'from-violet-600 to-purple-900',
  琵琶: 'from-pink-600 to-rose-900',
}

export function gradientFor(instrument: string): string {
  return INSTRUMENT_GRADIENT[instrument] || 'from-amber-600 to-orange-700'
}

export function genApplyNo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `MT${y}${m}${d}-${rand}`
}
