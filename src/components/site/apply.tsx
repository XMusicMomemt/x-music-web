'use client'

import { useState } from 'react'
import { BadgeCheck, FileCheck2, Info, Loader2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { INSTRUMENTS, CITIES, EDUCATIONS, GENDERS } from '@/lib/site'
import { apiFetch } from '@/lib/api'
import { applySchema as sharedApplySchema, type ApplyInput } from '@/lib/schemas'

const applySchema = sharedApplySchema

type ApplyForm = ApplyInput

const initialValues = {
  name: '',
  gender: '',
  phone: '',
  email: '',
  city: '',
  instrument: '',
  education: '',
  school: '',
  years: '' as string | number,
  title: '',
  bio: '',
  achievement: '',
}

export default function ApplyPage({ onNavigate }: { onNavigate: (tab: 'track') => void }) {
  const { toast } = useToast()
  const [values, setValues] = useState<Record<string, string | number>>({ ...initialValues })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ applyNo: string } | null>(null)

  const setField = (key: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const candidate: Record<string, unknown> = {
      ...values,
      years: values.years === '' ? -1 : Number(values.years),
    }
    const parsed = applySchema.safeParse(candidate)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '')
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      toast({
        title: '请检查填写内容',
        description: '部分信息尚未填写完整或格式不正确',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await apiFetch<{ applyNo: string; message: string }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify(parsed.data),
      })
      setSuccess({ applyNo: res.applyNo })
      toast({ title: '提交成功', description: res.message })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast({
        title: '提交失败',
        description: err instanceof Error ? err.message : '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
            <PartyPopper className="h-8 w-8 text-[var(--c-emerald-text)]" />
          </div>
          <h1 className="mt-6 font-serif text-2xl font-bold tracking-wide">申请已提交</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            评审团队将在 5 个工作日内完成资料审核，并通过短信 / 邮件通知您试讲安排。
            请妥善保存申请编号，随时查询审核进度。
          </p>
          <div className="mx-auto mt-6 flex max-w-xs items-center justify-between rounded-xl border border-primary/30 bg-accent px-4 py-3">
            <span className="text-sm text-accent-foreground">申请编号</span>
            <span className="font-mono font-semibold text-accent-foreground">{success.applyNo}</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => onNavigate('track')}>查询审核进度</Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(null)
                setValues({ ...initialValues })
              }}
            >
              再提交一份申请
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-primary">在线申请</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-wide sm:text-3xl">申请音乐老师认证</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          请如实填写以下信息，学历、经历与成果将在资质审核环节逐项核验，虚假信息将被永久拒绝申请。
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 表单主体 */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <FormCard title="基本信息">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="姓名" required error={errors.name}>
                <Input
                  value={String(values.name)}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="请填写身份证上的真实姓名"
                />
              </Field>
              <Field label="性别" required error={errors.gender}>
                <Select value={String(values.gender)} onValueChange={(v) => setField('gender', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="手机号码" required error={errors.phone} hint="用于接收审核通知与进度查询">
                <Input
                  value={String(values.phone)}
                  onChange={(e) => setField('phone', e.target.value)}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="11位手机号码"
                />
              </Field>
              <Field label="电子邮箱" error={errors.email} optional>
                <Input
                  value={String(values.email)}
                  onChange={(e) => setField('email', e.target.value)}
                  type="email"
                  placeholder="选填，便于接收试讲安排"
                />
              </Field>
            </div>
          </FormCard>

          <FormCard title="专业信息">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="所在城市" required error={errors.city}>
                <Select value={String(values.city)} onValueChange={(v) => setField('city', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择常驻教学城市" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="专业方向" required error={errors.instrument}>
                <Select
                  value={String(values.instrument)}
                  onValueChange={(v) => setField('instrument', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择主授专业" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTRUMENTS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="最高学历" required error={errors.education}>
                <Select
                  value={String(values.education)}
                  onValueChange={(v) => setField('education', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="毕业院校" required error={errors.school}>
                <Input
                  value={String(values.school)}
                  onChange={(e) => setField('school', e.target.value)}
                  placeholder="请填写最高学历毕业院校"
                />
              </Field>
              <Field label="教学年限（年）" required error={errors.years}>
                <Input
                  value={String(values.years)}
                  onChange={(e) => setField('years', e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  placeholder="如：5"
                />
              </Field>
              <Field label="职称 / 头衔" error={errors.title} optional>
                <Input
                  value={String(values.title)}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="选填，如：某乐团演奏员"
                />
              </Field>
            </div>
          </FormCard>

          <FormCard title="个人展示">
            <div className="space-y-4">
              <Field
                label="个人简介"
                required
                error={errors.bio}
                hint={`${String(values.bio).length}/600 字，至少 20 字`}
              >
                <Textarea
                  value={String(values.bio)}
                  onChange={(e) => setField('bio', e.target.value)}
                  rows={5}
                  placeholder="介绍教学经历、教学风格与擅长方向，例如：专注少儿钢琴启蒙…"
                />
              </Field>
              <Field
                label="获奖与专业成就"
                error={errors.achievement}
                optional
                hint="评审将逐项核验，请填写可查证的内容"
              >
                <Textarea
                  value={String(values.achievement)}
                  onChange={(e) => setField('achievement', e.target.value)}
                  rows={4}
                  placeholder="如：某比赛奖项、考级通过学员数、演出经历等，选填"
                />
              </Field>
            </div>
          </FormCard>

          <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-[var(--c-amber-text)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              提交即表示同意平台对所填信息进行核验。同一手机号同一时间仅能有一个待审核申请；
              如需修改资料，可在被驳回后重新提交。
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2 sm:w-auto" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
            {submitting ? '正在提交…' : '提交认证申请'}
          </Button>
        </form>

        {/* 侧栏：申请须知 */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="flex items-center gap-2 font-semibold">
              <BadgeCheck className="h-4.5 w-4.5 text-primary" />
              认证基本条件
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              {[
                '音乐院校或相关专业系统学习经历',
                '一线教学经验原则上满 3 年',
                '能提供可查证的专业成果材料',
                '无教学事故与虚假宣传记录',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">审核周期</h3>
            <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>资料审核</span>
                <span className="font-medium text-foreground">5 个工作日内</span>
              </li>
              <li className="flex justify-between">
                <span>试讲答辩</span>
                <span className="font-medium text-foreground">15 分钟线上</span>
              </li>
              <li className="flex justify-between">
                <span>官网公示</span>
                <span className="font-medium text-foreground">3 个工作日</span>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 className="mb-5 font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1">
        {label}
        {required ? <span className="text-destructive">*</span> : null}
        {optional ? <span className="text-xs font-normal text-muted-foreground">（选填）</span> : null}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
