'use client'

import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Mic,
  GraduationCap,
  Clock3,
  Award,
  Music2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { TeacherCard } from '@/components/site/teacher-card'
import { apiFetch } from '@/lib/api'
import type { SiteStats, TeacherPublic } from '@/lib/types'
import type { TabKey } from '@/app/page'

export default function HomePage({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [featured, setFeatured] = useState<TeacherPublic[]>([])

  useEffect(() => {
    apiFetch<SiteStats>('/api/stats')
      .then(setStats)
      .catch(() => setStats({ approvedCount: 0, cityCount: 0, instrumentCount: 0, monthlyNew: 0 }))
    apiFetch<{ teachers: TeacherPublic[] }>('/api/teachers')
      .then((d) => setFeatured(d.teachers.slice(0, 6)))
      .catch(() => setFeatured([]))
  }, [])

  return (
    <div>
      {/* 品牌主视觉 */}
      <section className="relative overflow-hidden bg-[var(--hero-bg)] text-foreground">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(640px 320px at 82% 18%, rgba(212,175,105,0.16), transparent 70%), radial-gradient(520px 280px at 8% 92%, rgba(212,175,105,0.09), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute left-[8%] top-[18%] rotate-12 text-white/[0.06]">
            <Music2 className="h-10 w-10" />
          </div>
          <div className="absolute right-[30%] top-[12%] -rotate-6 text-white/[0.05]">
            <Music2 className="h-6 w-6" />
          </div>
          <div className="absolute bottom-[18%] left-[22%] -rotate-12 text-white/[0.04]">
            <Music2 className="h-8 w-8" />
          </div>
          <div className="absolute bottom-[30%] right-[8%] rotate-6 text-white/[0.05]">
            <Music2 className="h-12 w-12" />
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-primary/80">
              Music Moment · 官方认证主体
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              官方认证 · 行业可信
            </span>
            <h1 className="mt-5 font-serif text-3xl font-bold leading-tight tracking-wide sm:text-4xl md:text-5xl">
              让每一位音乐老师
              <br />
              都被<span className="text-primary">专业认证</span>见证
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              音乐瞬间面向全国音乐教育工作者，提供学历核验、能力评审、试讲答辩的完整认证流程。
              通过认证的老师将在官网公开展示，让家长与学员找得放心、学得安心。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onNavigate('apply')} className="gap-2">
                提交认证申请
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('teachers')}
                className="border-[var(--hairline)] bg-transparent text-foreground hover:border-primary/40 hover:bg-transparent hover:text-primary"
              >
                浏览认证老师
              </Button>
            </div>
          </div>

          {/* 认证徽章示意 */}
          <div className="mx-auto w-full max-w-sm">
            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-card)] p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Music2 className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-serif font-semibold tracking-wide">音乐瞬间</span>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-[var(--c-emerald-text)]">
                  认证有效
                </span>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(212,175,105,0.15)]">
                  <BadgeCheck className="h-12 w-12 text-primary" />
                </div>
                <p className="mt-4 font-serif text-lg font-semibold tracking-wide">音乐老师 · 专业认证</p>
                <p className="mt-1 text-sm text-muted-foreground">资质审核 · 试讲答辩 · 双重评审</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {['学历核验', '能力评审', '官网公示'].map((t) => (
                  <div key={t} className="rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] px-2 py-3 text-xs text-muted-foreground">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 数据总览 */}
      <section className="border-b border-[var(--hairline)] bg-[var(--surface-soft)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 sm:px-6 md:grid-cols-4">
          <StatItem value={stats ? `${stats.approvedCount}` : '—'} label="认证老师" />
          <StatItem value={stats ? `${stats.cityCount}` : '—'} label="覆盖城市" />
          <StatItem value={stats ? `${stats.instrumentCount}` : '—'} label="专业方向" />
          <StatItem value={stats ? `${stats.monthlyNew}` : '—'} label="本月新增认证" />
        </div>
      </section>

      {/* 认证流程 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionTitle
          eyebrow="认证流程"
          title="四步完成官方认证"
          description="从提交申请到官网公示，全程线上可查，评审团队 5 个工作日内反馈结果"
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            {
              icon: FileText,
              title: '提交申请',
              desc: '填写个人与专业信息，三分钟完成在线申请',
            },
            {
              icon: ClipboardCheck,
              title: '资质审核',
              desc: '评审核验学历背景、教学经历与获奖材料',
            },
            {
              icon: Mic,
              title: '专业试讲',
              desc: '15 分钟线上试讲与答辩，展示真实教学水平',
            },
            {
              icon: BadgeCheck,
              title: '公示授证',
              desc: '审核通过后在官网公示，并颁发认证标识',
            },
          ].map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-xl border border-[var(--hairline)] bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="absolute right-4 top-4 font-serif text-4xl font-bold text-primary/10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <step.icon className="h-5.5 w-5.5" />
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 认证标准 */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface-soft)] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="认证标准"
            title="三个维度，专业把关"
            description="由音乐学院教师、一线教研专家组成的评审委员会统一评定"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: '学历与专业背景',
                desc: '音乐院校或相关专业系统学习经历，学历信息逐项核验，杜绝虚假包装。',
              },
              {
                icon: Clock3,
                title: '一线教学经验',
                desc: '原则上要求一线教学满 3 年，教学成果突出者可适当放宽，以学员评价佐证。',
              },
              {
                icon: Award,
                title: '专业能力可查可证',
                desc: '演奏 / 演唱水平、比赛获奖、教研成果均需提供可查证材料，试讲环节现场检验。',
              },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-[var(--hairline)] bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                  <c.icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 精选认证老师 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle
            eyebrow="老师展示"
            title="精选认证老师"
            description="以下老师均已通过平台完整认证流程，档案信息公开可查"
          />
          <Button variant="ghost" className="gap-1 text-primary hover:text-primary" onClick={() => onNavigate('teachers')}>
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {featured.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            认证老师正在陆续入驻，敬请期待
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <TeacherCard key={t.id} teacher={t} />
            ))}
          </div>
        )}
      </section>

      {/* 常见问题 */}
      <section className="border-y border-[var(--hairline)] bg-[var(--surface-soft)] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle
            eyebrow="常见问题"
            title="关于认证，你可能想知道"
            description=""
          />
          <Accordion type="single" collapsible className="mt-8">
            {[
              {
                q: '申请认证需要满足什么条件？',
                a: '原则上需满足：音乐院校或相关专业学习经历、一线教学满 3 年、能提供可查证的专业成果材料。特殊人才（如获奖演奏者）条件可适当放宽，由评审委员会个案评估。',
              },
              {
                q: '认证是否收费？',
                a: '申请与审核环节均不收取任何费用。认证通过后如需实体证书与牌匾，仅收取工本制作费，可在通过后自愿选择。',
              },
              {
                q: '审核需要多长时间？',
                a: '资料审核一般在 5 个工作日内完成，随后会邮件或短信通知试讲安排。试讲通过后 3 个工作日内完成官网公示。',
              },
              {
                q: '如何查询申请进度？',
                a: '进入「进度查询」页面，输入申请时填写的手机号，即可查看当前审核状态与评审意见。',
              },
              {
                q: '认证结果有效期多久？',
                a: '认证标识有效期 3 年，到期前将提示复检（更新教学成果即可）。若查实信息造假，将立即撤销认证并下架展示页。',
              },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 底部行动号召 */}
      <section className="relative overflow-hidden bg-[var(--hero-bg)] py-14 text-center text-foreground">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(560px 260px at 50% 0%, rgba(212,175,105,0.12), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <BadgeCheck className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 font-serif text-2xl font-bold tracking-wide sm:text-3xl">值得信赖，从认证开始</h2>
          <p className="mt-3 text-muted-foreground">
            无论是想获得官方认证的老师，还是想寻找好老师的学员，都从这里出发
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => onNavigate('apply')}>
              我是老师，申请认证
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[var(--hairline)] bg-transparent text-foreground hover:border-primary/40 hover:bg-transparent hover:text-primary"
              onClick={() => onNavigate('teachers')}
            >
              我是学员，找认证老师
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-2xl font-bold tracking-wide sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-3xl font-bold text-primary sm:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
