'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, RotateCcw, Inbox } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TeacherCard } from '@/components/site/teacher-card'
import { INSTRUMENTS, CITIES } from '@/lib/site'
import { apiFetch } from '@/lib/api'
import type { TeacherPublic } from '@/lib/types'

export default function TeachersPage() {
  const [instrument, setInstrument] = useState<string>('全部')
  const [city, setCity] = useState<string>('all')
  const [q, setQ] = useState('')
  const [teachers, setTeachers] = useState<TeacherPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (instrument !== '全部') params.set('instrument', instrument)
      if (city !== 'all') params.set('city', city)
      if (q.trim()) params.set('q', q.trim())
      const data = await apiFetch<{ teachers: TeacherPublic[] }>(
        `/api/teachers?${params.toString()}`
      )
      setTeachers(data.teachers)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [instrument, city, q])

  useEffect(() => {
    const timer = setTimeout(load, q ? 300 : 0)
    return () => clearTimeout(timer)
  }, [load, q])

  const resetFilters = () => {
    setInstrument('全部')
    setCity('all')
    setQ('')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium tracking-wide text-primary">认证老师展示</p>
        <h1 className="mt-2 font-serif text-2xl font-bold tracking-wide sm:text-3xl">
          找到值得信赖的音乐老师
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          以下老师均通过学历核验、能力评审与试讲答辩，档案信息持续公示，支持按专业方向与城市筛选。
        </p>
      </div>

      {/* 筛选区 */}
      <div className="mt-8 space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {['全部', ...INSTRUMENTS].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setInstrument(item)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                instrument === item
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full sm:w-40" aria-label="选择城市">
              <SelectValue placeholder="全部城市" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部城市</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索姓名、院校、专业关键词"
              className="pl-9"
              aria-label="搜索认证老师"
            />
          </div>
          <Button variant="outline" onClick={resetFilters} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            重置
          </Button>
        </div>
      </div>

      {/* 统计行 */}
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {loading ? '正在加载…' : `共 ${teachers.length} 位认证老师`}
      </p>

      {/* 列表 */}
      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="mt-4 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-4/5" />
              <Skeleton className="mt-4 h-8 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={load}>
            重新加载
          </Button>
        </div>
      ) : teachers.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            没有找到符合条件的认证老师，试试调整筛选条件
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      )}
    </div>
  )
}
