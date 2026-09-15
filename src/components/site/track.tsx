'use client'

import { useState } from 'react'
import { Search, Loader2, CircleCheck, ClipboardCheck, Sparkles, CircleX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { STATUS_LABEL } from '@/lib/site'
import { apiFetch, formatDate } from '@/lib/api'
import type { TrackApplication } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-400/10 text-[var(--c-amber-text)] border-amber-400/30',
  APPROVED: 'bg-emerald-400/10 text-[var(--c-emerald-text)] border-emerald-400/30',
  REJECTED: 'bg-red-400/10 text-[var(--c-red-text)] border-red-400/30',
}

export default function TrackPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TrackApplication | null>(null)

  const query = async () => {
    setError('')
    setResult(null)
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError('请输入申请时填写的11位手机号码')
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<{ application: TrackApplication }>(
        `/api/applications/track?phone=${encodeURIComponent(phone.trim())}`
      )
      setResult(data.application)
    } catch (e) {
      setError(e instanceof Error ? e.message : '查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { key: 'SUBMITTED', label: '提交申请', icon: Search },
    { key: 'PENDING', label: '评审审核', icon: ClipboardCheck },
    { key: 'APPROVED', label: '公示认证', icon: Sparkles },
  ]
  const activeIndex =
    result?.status === 'APPROVED' ? 2 : result?.status === 'PENDING' ? 1 : 1

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div>
        <p className="text-sm font-medium tracking-wide text-primary">进度查询</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-wide sm:text-3xl">查询认证申请进度</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          输入申请时填写的手机号，即可查看当前审核状态与评审意见。信息仅返回申请概要，不会泄露完整资料。
        </p>
      </div>

      <div className="mt-8 rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') query()
            }}
            inputMode="numeric"
            placeholder="请输入11位手机号码"
            aria-label="手机号码"
            className="flex-1"
          />
          <Button onClick={query} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            查询进度
          </Button>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {result ? (
        <div className="mt-6 rounded-xl border bg-card p-5 sm:p-6" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">申请编号</p>
              <p className="font-mono text-lg font-semibold">{result.applyNo}</p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-medium ${STATUS_STYLES[result.status] || 'bg-muted'}`}
            >
              {STATUS_LABEL[result.status]}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">申请人</dt>
              <dd className="mt-0.5 font-medium">{result.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">专业方向</dt>
              <dd className="mt-0.5 font-medium">{result.instrument}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">提交日期</dt>
              <dd className="mt-0.5 font-medium">{formatDate(result.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">完成评审</dt>
              <dd className="mt-0.5 font-medium">{formatDate(result.reviewedAt)}</dd>
            </div>
          </dl>

          {/* 进度时间线 */}
          <div className="mt-7">
            <div className="flex items-center">
              {steps.map((step, i) => {
                const reached = result.status === 'REJECTED' ? i <= 1 : i <= activeIndex
                const isLast = i === steps.length - 1
                return (
                  <div key={step.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          reached
                            ? result.status === 'REJECTED' && i === 1
                              ? 'border-red-400/40 bg-red-400/10 text-[var(--c-red-text)]'
                              : 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted text-muted-foreground'
                        }`}
                      >
                        {reached && i === activeIndex && result.status !== 'REJECTED' ? (
                          <step.icon className="h-4.5 w-4.5" />
                        ) : reached ? (
                          result.status === 'REJECTED' && i === 1 ? (
                            <CircleX className="h-4.5 w-4.5" />
                          ) : (
                            <CircleCheck className="h-4.5 w-4.5" />
                          )
                        ) : (
                          <step.icon className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${reached ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast ? (
                      <div
                        className={`mx-2 mb-5 h-0.5 flex-1 rounded ${
                          i < activeIndex ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          {result.status === 'REJECTED' && result.reviewNote ? (
            <div className="mt-6 rounded-lg border border-red-400/25 bg-red-400/[0.06] p-4 text-sm text-[var(--c-red-text)]">
              <p className="font-medium">评审意见</p>
              <p className="mt-1 leading-relaxed">{result.reviewNote}</p>
            </div>
          ) : null}
          {result.status === 'APPROVED' ? (
            <p className="mt-6 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.06] p-4 text-sm text-[var(--c-emerald-text)]">
              恭喜！认证信息已在官网「认证老师展示」页公示，学员与家长可以查看到您的认证档案。
            </p>
          ) : null}
          {result.status === 'PENDING' ? (
            <p className="mt-6 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm text-[var(--c-amber-text)]">
              资料审核一般需要 5 个工作日，通过后将短信通知您参加线上试讲，请保持手机畅通。
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
