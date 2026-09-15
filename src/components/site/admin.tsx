'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LogIn,
  LogOut,
  Loader2,
  RefreshCw,
  Check,
  X,
  ShieldCheck,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { apiFetch, clearAdminToken, formatDate, getAdminToken, setAdminToken } from '@/lib/api'
import { STATUS_LABEL } from '@/lib/site'
import type { ApplicationFull } from '@/lib/types'

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-400/15 text-[var(--c-amber-text)]',
  APPROVED: 'bg-emerald-400/15 text-[var(--c-emerald-text)]',
  REJECTED: 'bg-red-400/15 text-[var(--c-red-text)]',
}

export default function AdminDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [hasToken, setHasToken] = useState(false)

  // 每次打开弹层时读取本地登录态（事件回调，避免 effect 内同步 setState）
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) setHasToken(Boolean(getAdminToken()))
      onOpenChange(next)
    },
    [onOpenChange]
  )

  const onLogout = useCallback(() => {
    clearAdminToken()
    setHasToken(false)
    toast({ title: '已退出管理端登录' })
  }, [toast])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-3xl">
        {hasToken ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                认证审核工作台
              </DialogTitle>
              <DialogDescription>评审委员会专用：审批音乐老师认证申请</DialogDescription>
            </DialogHeader>
            <ReviewPanel onLogout={onLogout} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                管理员登录
              </DialogTitle>
              <DialogDescription>请使用评审委员会分配的管理账号登录</DialogDescription>
            </DialogHeader>
            <LoginForm onLogin={() => setHasToken(true)} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      toast({ title: '请输入账号和密码', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch<{ token: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      })
      setAdminToken(data.token)
      toast({ title: '登录成功' })
      onLogin()
    } catch (err) {
      toast({
        title: '登录失败',
        description: err instanceof Error ? err.message : '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="admin-username">账号</Label>
        <Input
          id="admin-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="管理员账号"
          autoComplete="username"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">密码</Label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理员密码"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        登录
      </Button>
    </form>
  )
}

function ReviewPanel({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast()
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [list, setList] = useState<ApplicationFull[]>([])
  const [loading, setLoading] = useState(true)
  const [rejecting, setRejecting] = useState<ApplicationFull | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actingId, setActingId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = status === 'ALL' ? '' : `?status=${status}`
      const data = await apiFetch<{ applications: ApplicationFull[] }>(
        `/api/admin/applications${params}`,
        { auth: true }
      )
      setList(data.applications)
    } catch (err) {
      if (err instanceof Error && err.name === 'Unauthorized') {
        clearAdminToken()
        onLogout()
        toast({ title: '登录已过期，请重新登录', variant: 'destructive' })
        return
      }
      toast({
        title: '加载失败',
        description: err instanceof Error ? err.message : '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [status, onLogout, toast])

  useEffect(() => {
    load()
  }, [load])

  const review = async (app: ApplicationFull, decision: 'APPROVED' | 'REJECTED', note = '') => {
    setActingId(app.id)
    try {
      await apiFetch(`/api/admin/applications/${app.id}`, {
        method: 'PATCH',
        auth: true,
        body: JSON.stringify({ status: decision, reviewNote: note }),
      })
      toast({
        title: decision === 'APPROVED' ? '已通过认证' : '已驳回申请',
        description: `${app.name}（${app.applyNo}）`,
      })
      setRejecting(null)
      setRejectNote('')
      load()
    } catch (err) {
      if (err instanceof Error && err.name === 'Unauthorized') {
        clearAdminToken()
        onLogout()
      }
      toast({
        title: '操作失败',
        description: err instanceof Error ? err.message : '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setActingId('')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['ALL', '全部'],
            ['PENDING', '待审核'],
            ['APPROVED', '已通过'],
            ['REJECTED', '已驳回'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatus(key)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              status === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onLogout}>
            <LogOut className="h-3.5 w-3.5" />
            退出
          </Button>
        </div>
      </div>

      <div className="nice-scroll max-h-[52vh] min-h-0 space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在加载申请列表…
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">暂无该状态的申请</p>
          </div>
        ) : (
          list.map((app) => (
            <div key={app.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{app.name}</span>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  {app.instrument}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {app.city} · 教龄 {app.years} 年 · {app.school}
                </span>
                <Badge className={`ml-auto ${STATUS_BADGE[app.status] || ''}`}>
                  {STATUS_LABEL[app.status]}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{app.bio}</p>
              {app.reviewNote ? (
                <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  评审意见：{app.reviewNote}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-xs text-muted-foreground">
                  编号 {app.applyNo} · 提交于 {formatDate(app.createdAt)} · {app.phone}
                </span>
                {app.status === 'PENDING' ? (
                  <div className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={actingId === app.id}
                      onClick={() => review(app, 'APPROVED')}
                    >
                      <Check className="h-3.5 w-3.5" />
                      通过认证
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-red-400/30 text-[var(--c-red-text)] hover:bg-red-400/10 hover:text-[var(--c-red-text)]"
                      disabled={actingId === app.id}
                      onClick={() => {
                        setRejecting(app)
                        setRejectNote('')
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                      驳回
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 驳回意见弹层 */}
      {rejecting ? (
        <div className="rounded-xl border border-red-400/25 bg-red-400/[0.06] p-4">
          <p className="text-sm font-medium text-[var(--c-red-text)]">
            驳回 {rejecting.name} 的申请（{rejecting.applyNo}）
          </p>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            className="mt-2 border-red-400/25 bg-transparent placeholder:text-muted-foreground/50"
            placeholder="请填写驳回原因，将展示给申请人（至少4个字）"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRejecting(null)}>
              取消
            </Button>
            <Button
              size="sm"
              className="bg-red-500 text-white hover:bg-red-500/90"
              disabled={actingId === rejecting.id}
              onClick={() => review(rejecting, 'REJECTED', rejectNote.trim())}
            >
              确认驳回
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
