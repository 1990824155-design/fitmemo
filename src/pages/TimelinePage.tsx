import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { formatCnDate, monthLabel, todayKey } from '../lib/dates'
import { countFilledSets } from '../lib/sets'
import { useStore } from '../lib/store'
import type { WorkoutDay } from '../lib/types'

function isMeaningfulWorkout(w: WorkoutDay) {
  return w.exercises.length > 0
}

export function TimelinePage() {
  const { data, deleteWorkout } = useStore()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<WorkoutDay | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const workouts = useMemo(
    () =>
      [...data.workouts]
        .filter(isMeaningfulWorkout)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.workouts],
  )

  const groups = useMemo(() => {
    return workouts.reduce<Record<string, WorkoutDay[]>>((acc, w) => {
      const key = monthLabel(w.date)
      ;(acc[key] ??= []).push(w)
      return acc
    }, {})
  }, [workouts])

  return (
    <>
      <AppHeader title="Timeline" />
      <main className="bg-surface pb-6">
        <div className="px-page pt-6 pb-4">
          <h1 className="mb-2 text-[32px] leading-10 font-bold tracking-tight">时间线</h1>
          <p className="text-base text-on-surface-variant">你的训练足迹，每一次都算数。</p>
        </div>

        {!workouts.length && (
          <div className="mt-16 flex flex-col items-center gap-3 px-page text-center">
            <span className="text-5xl">🗓️</span>
            <p className="text-[20px] font-semibold">还没有历史训练</p>
            <p className="text-sm text-on-surface-variant">去 Today 记一组，就会出现在这里。</p>
            <Link
              to="/"
              className="mt-2 rounded-xl bg-primary-container px-5 py-3 text-sm font-semibold"
            >
              去开练
            </Link>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-card px-page">
          {Object.entries(groups).map(([month, list]) => (
            <section key={month} className="flex flex-col gap-card">
              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-surface-container-highest" />
                <span className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                  {month}
                </span>
                <div className="h-px flex-1 bg-surface-container-highest" />
              </div>

              {list.map((w) => {
                const doneSets = w.exercises.reduce(
                  (n, e) => n + countFilledSets(e.sets),
                  0,
                )
                const isToday = w.date === todayKey()
                return (
                  <article
                    key={w.id}
                    className="rounded-xl border border-on-surface/10 bg-surface-container-lowest p-4 shadow-sm transition-shadow active:translate-x-px active:translate-y-px"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[20px] leading-7 font-semibold">
                          {w.focus || '未命名训练'}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {formatTimelineWhen(w.date)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center">
                        <button
                          type="button"
                          className="rounded-lg bg-primary-container px-3 py-1 text-xs font-bold tracking-wider text-on-primary-container uppercase active:translate-y-px"
                          onClick={() => {
                            if (isToday) {
                              navigate('/')
                              return
                            }
                            navigate(`/workout/${w.id}`)
                          }}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="ml-2 flex items-center justify-center rounded-lg bg-surface-container p-1 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error active:translate-y-px"
                          aria-label="删除训练"
                          onClick={() => setDeleteTarget(w)}
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {w.exercises.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="rounded-lg bg-surface-container px-2 py-1 text-sm"
                        >
                          {e.name}
                        </span>
                      ))}
                      {w.exercises.length > 3 && (
                        <span className="rounded-lg bg-surface-container px-2 py-1 text-sm text-on-surface-variant">
                          +{w.exercises.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-surface-container-highest/50 pt-3">
                      <div className="flex items-center gap-2">
                        <Icon name="verified" className="text-[18px] text-primary" />
                        <span className="text-sm text-on-surface-variant">
                          {w.savedAt ? '已完成' : '进行中'} · {doneSets} 组
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-secondary">
                        <Icon name="local_fire_department" className="text-[16px]" />
                        <span className="text-xs font-bold tracking-wider">
                          表现 {w.performance}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          ))}
        </div>

        <div className="mt-12 mb-8 px-page">
          <div className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-secondary/20 bg-secondary-container/30 p-6 text-center">
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-on-surface/5 bg-surface shadow-sm">
              <Icon name="cloud_download" className="text-secondary" />
            </div>
            <h4 className="mb-2 text-[20px] font-semibold">数据属于你</h4>
            <p className="mb-6 max-w-[250px] text-sm text-on-surface-variant">
              导出训练与身体记录，备份或交给外部 AI 分析。
            </p>
            <Link
              to="/more"
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-secondary-fixed text-base font-medium text-on-secondary-fixed active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>导出数据</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-y-0 left-1/2 z-[70] flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-on-surface/40 p-page backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-on-surface/10 bg-surface-container-lowest shadow-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
                <Icon name="warning" />
              </div>
              <h3 className="mb-2 text-[20px] font-semibold">确定删除吗？</h3>
              <p className="mb-2 text-sm text-on-surface-variant">
                删除后将无法找回此条记录。
              </p>
              <p className="mb-6 text-sm font-medium text-on-surface">
                {deleteTarget.focus || '未命名训练'} · {formatCnDate(deleteTarget.date).short}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="h-12 flex-1 rounded-xl bg-surface-container text-base font-medium active:translate-y-px"
                  onClick={() => setDeleteTarget(null)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="h-12 flex-1 rounded-xl bg-error text-base font-medium text-on-primary active:translate-y-px"
                  onClick={() => {
                    deleteWorkout(deleteTarget.id)
                    setDeleteTarget(null)
                    setToast('已删除训练记录')
                  }}
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}

function formatTimelineWhen(dateKey: string) {
  const today = todayKey()
  if (dateKey === today) return `今天 · ${formatCnDate(dateKey).withWeek}`
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const yesterday = `${y}-${m}-${day}`
  if (dateKey === yesterday) return `昨天 · ${formatCnDate(dateKey).withWeek}`
  return formatCnDate(dateKey).withWeek
}
