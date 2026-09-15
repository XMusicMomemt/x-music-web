'use client'

import { useState } from 'react'
import { Music2, BadgeCheck, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomePage from '@/components/site/home'
import TeachersPage from '@/components/site/teachers'
import ApplyPage from '@/components/site/apply'
import TrackPage from '@/components/site/track'
import AdminDialog from '@/components/site/admin'

export type TabKey = 'home' | 'teachers' | 'apply' | 'track'

const NAV_ITEMS: { key: TabKey; label: string }[] = [
  { key: 'home', label: '首页' },
  { key: 'teachers', label: '认证老师' },
  { key: 'apply', label: '申请认证' },
  { key: 'track', label: '进度查询' },
]

export default function Page() {
  const [tab, setTab] = useState<TabKey>('home')
  const [adminOpen, setAdminOpen] = useState(false)

  const navigate = (next: TabKey) => {
    setTab(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5"
            aria-label="返回首页"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
              <Music2 className="h-4.5 w-4.5" />
            </span>
            <span className="text-left leading-tight">
              <span className="block font-serif text-lg font-bold tracking-wide">音乐瞬间</span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Music Moment Certification
              </span>
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.key)}
                className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  tab === item.key
                    ? 'bg-accent font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            <Button size="sm" className="gap-1.5" onClick={() => navigate('apply')}>
              <BadgeCheck className="h-4 w-4" />
              立即申请
            </Button>
          </div>
        </div>
        {/* 移动端导航 */}
        <nav
          className="flex items-center gap-1 overflow-x-auto border-t border-[var(--hairline)] px-4 py-1.5 md:hidden"
          aria-label="移动端导航"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.key)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                tab === item.key
                  ? 'bg-accent font-medium text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 主体内容 */}
      <main className="flex-1">
        {tab === 'home' && <HomePage onNavigate={navigate} />}
        {tab === 'teachers' && <TeachersPage />}
        {tab === 'apply' && <ApplyPage onNavigate={(t) => navigate(t)} />}
        {tab === 'track' && <TrackPage />}
      </main>

      {/* 页脚 */}
      <footer className="mt-auto border-t border-[var(--hairline)] bg-[var(--hero-bg)] text-muted-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <Music2 className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg font-bold tracking-wide text-foreground">音乐瞬间</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              音乐教师认证官方主体。以专业评审与公开公示，建立老师与学员之间的信任桥梁，让每一次教学都值得托付。
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/90">快捷导航</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className="transition-colors hover:text-primary"
                    onClick={() => navigate(item.key)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/90">联系我们</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>认证主体：音乐瞬间（MUSIC MOMENT）</li>
              <li>认证咨询：workdays 9:00 - 18:00</li>
              <li>评审委员会：review@musicmoment.cn</li>
              <li>申诉与反馈：appeal@musicmoment.cn</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
            <p>© {new Date().getFullYear()} 音乐瞬间 · 让专业被看见</p>
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="inline-flex items-center gap-1 transition-colors hover:text-primary"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              评审委员会入口
            </button>
          </div>
        </div>
      </footer>

      <AdminDialog open={adminOpen} onOpenChange={setAdminOpen} />
    </div>
  )
}
