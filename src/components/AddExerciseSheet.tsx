import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Icon } from './Icon'

type Props = {
  open: boolean
  onClose: () => void
  onToast: (msg: string) => void
  /** 不传则加入今日 */
  workoutId?: string
}

export function AddExerciseSheet({ open, onClose, onToast, workoutId }: Props) {
  const { data, addExerciseToToday, addExerciseToWorkout, upsertExercise } = useStore()
  const [q, setQ] = useState('')

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return data.exercises.filter((e) => !e.archived).slice(0, 12)
    return data.exercises
      .filter((e) => !e.archived && e.name.toLowerCase().includes(query))
      .slice(0, 20)
  }, [data.exercises, q])

  const exact = matches.some((m) => m.name === q.trim())
  const showCreate = q.trim().length > 0 && !exact
  const targetLabel = workoutId ? '该日训练' : '今日'

  const addOne = (ex: { id: string; name: string } | { name: string }) => {
    const ok = workoutId
      ? addExerciseToWorkout(workoutId, ex as { id: string; name: string })
      : addExerciseToToday(ex as { id: string; name: string })
    return ok
  }

  if (!open) return null

  return (
    <div className="fixed inset-y-0 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col bg-surface-container-highest/50 p-page pt-safe backdrop-blur-md">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-on-surface/5 bg-surface shadow-lg">
        <div className="border-b border-on-surface/5 p-element">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant"
              onClick={onClose}
            >
              <Icon name="close" className="text-[20px]" />
            </button>
            <div className="relative flex-1">
              <Icon
                name="search"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-on-surface-variant/50"
              />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索或新增动作…"
                className="h-10 w-full rounded-xl border border-transparent bg-[#f1f1f0] pr-3 pl-9 text-base font-medium outline-none focus:border-on-surface"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {matches.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className="group flex w-full items-center px-element py-3 text-left hover:bg-surface-container-low"
              onClick={() => {
                const ok = addOne(ex)
                if (!ok) {
                  onToast(`${targetLabel}已有「${ex.name}」`)
                  return
                }
                onToast(`已加入${targetLabel}：${ex.name}`)
                onClose()
                setQ('')
              }}
            >
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <Icon name="fitness_center" className="text-[16px]" />
              </div>
              <div className="min-w-0 flex-1">
                <Highlight name={ex.name} query={q.trim()} />
                <span className="block truncate text-sm text-on-surface-variant">
                  {ex.tags.join(' · ') || '未分类'}
                </span>
              </div>
              <Icon
                name="add_circle"
                className="text-[20px] text-on-surface-variant/30 group-hover:text-primary"
              />
            </button>
          ))}

          {showCreate && (
            <div className="mt-2 border-t border-on-surface/5 p-element">
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-primary-container bg-primary-container/30 p-4 active:translate-x-px active:translate-y-px"
                onClick={() => {
                  const ex = upsertExercise(q.trim())
                  const ok = addOne(ex)
                  if (!ok) {
                    onToast(`${targetLabel}已有「${ex.name}」`)
                    return
                  }
                  onToast(`已新增「${ex.name}」并加入${targetLabel}`)
                  onClose()
                  setQ('')
                }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm">
                  <Icon name="library_add" className="text-[20px]" />
                </div>
                <div className="text-center">
                  <span className="block text-base">
                    确认新增「<span className="font-bold text-primary">{q.trim()}</span>
                    」并加入动作库
                  </span>
                  <span className="text-sm text-on-surface-variant">同步到{targetLabel}</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Highlight({ name, query }: { name: string; query: string }) {
  if (!query) return <span className="block truncate text-base">{name}</span>
  const i = name.toLowerCase().indexOf(query.toLowerCase())
  if (i < 0) return <span className="block truncate text-base">{name}</span>
  return (
    <span className="block truncate text-base">
      {name.slice(0, i)}
      <span className="font-bold text-primary">{name.slice(i, i + query.length)}</span>
      {name.slice(i + query.length)}
    </span>
  )
}
