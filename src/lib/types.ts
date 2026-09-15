// 与后端 API 对应的前端类型

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface TeacherPublic {
  id: string
  applyNo: string
  name: string
  gender: string
  city: string
  instrument: string
  education: string
  school: string
  years: number
  title: string | null
  bio: string
  achievement: string | null
  reviewedAt: string | null
}

export interface SiteStats {
  approvedCount: number
  cityCount: number
  instrumentCount: number
  monthlyNew: number
}

export interface TrackApplication {
  applyNo: string
  name: string
  instrument: string
  city: string
  status: ApplicationStatus
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface ApplicationFull {
  id: string
  applyNo: string
  name: string
  gender: string
  phone: string
  email: string | null
  city: string
  instrument: string
  education: string
  school: string
  years: number
  title: string | null
  bio: string
  achievement: string | null
  status: ApplicationStatus
  reviewNote: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}
