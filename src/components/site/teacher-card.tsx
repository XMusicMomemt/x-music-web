'use client'

import { useState } from 'react'
import {
  BadgeCheck,
  MapPin,
  Music2,
  Award,
  Clock3,
  GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { gradientFor, STATUS_LABEL } from '@/lib/site'
import { formatDate } from '@/lib/api'
import type { TeacherPublic } from '@/lib/types'

export function TeacherAvatar({
  name,
  instrument,
  size = 'md',
}: {
  name: string
  instrument: string
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg'
  return (
    <div
      className={`${dim} ${gradientFor(instrument)} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-amber-50 ring-1 ring-[var(--hairline)] shadow-inner`}
      aria-hidden="true"
    >
      {name.slice(0, 1)}
    </div>
  )
}

export function TeacherCard({ teacher }: { teacher: TeacherPublic }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <article className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start gap-3">
          <TeacherAvatar name={teacher.name} instrument={teacher.instrument} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold">{teacher.name}</h3>
              <BadgeCheck className="h-4.5 w-4.5 shrink-0 fill-primary text-primary-foreground" />
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {teacher.title || `${teacher.instrument}教学`}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 bg-accent text-accent-foreground">
            <Music2 className="mr-1 h-3 w-3" />
            {teacher.instrument}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {teacher.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            教龄 {teacher.years} 年
          </span>
          <span className="inline-flex items-center gap-1 truncate">
            <GraduationCap className="h-3.5 w-3.5" />
            {teacher.school} · {teacher.education}
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {teacher.bio}
        </p>

        {teacher.achievement ? (
          <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Award className="mr-1 inline h-3.5 w-3.5 text-primary" />
            {teacher.achievement}
          </p>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full border-primary/30 text-primary hover:bg-accent hover:text-accent-foreground"
          onClick={() => setOpen(true)}
        >
          查看认证档案
        </Button>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto nice-scroll sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-left">
              <TeacherAvatar name={teacher.name} instrument={teacher.instrument} size="lg" />
              <span>
                <span className="flex items-center gap-1.5 text-lg">
                  {teacher.name}
                  <BadgeCheck className="h-5 w-5 fill-primary text-primary-foreground" />
                </span>
                <span className="mt-1 block text-sm font-normal text-muted-foreground">
                  认证编号 {teacher.applyNo}
                </span>
              </span>
            </DialogTitle>
            <DialogDescription className="text-left">
              以下信息已通过平台资质审核与专业试讲评审
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="专业方向" value={teacher.instrument} />
              <InfoItem label="所在城市" value={teacher.city} />
              <InfoItem label="毕业院校" value={teacher.school} />
              <InfoItem label="最高学历" value={teacher.education} />
              <InfoItem label="教学年限" value={`${teacher.years} 年`} />
              <InfoItem label="认证时间" value={formatDate(teacher.reviewedAt)} />
            </div>
            {teacher.title ? <InfoItem label="职称 / 头衔" value={teacher.title} /> : null}
            <InfoItem label="个人简介" value={teacher.bio} />
            {teacher.achievement ? (
              <InfoItem label="获奖与成就" value={teacher.achievement} />
            ) : null}
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-accent px-4 py-3">
              <span className="text-sm text-accent-foreground">认证状态</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-accent-foreground">
                <BadgeCheck className="h-4 w-4" />
                {STATUS_LABEL.APPROVED}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={label === '个人简介' || label === '获奖与成就' ? 'col-span-2' : ''}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 leading-relaxed">{value}</p>
    </div>
  )
}
