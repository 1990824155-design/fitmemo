import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { useStore } from '../lib/store'

export function TemplateEditPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { data, addTemplate, updateTemplate, upsertExercise } = useStore()

  const existing = useMemo(
    () => (!isNew ? data.templates.find((t) => t.id === id) : undefined),
    [data.templates, id, isNew],
  )

  const [name, setName] = useState(existing?.name ?? '')
  const [exerciseIds, setExerciseIds] = useState<string[]>(existing?.exerciseIds ?? [])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const overIdRef = useRef<string | null>(null)
  const dragRef = useRef<{ id: string; startY: number; moved: boolean } | null>(null)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setExerciseIds(existing.exerciseIds)
    }
  }, [existing])

  const rows = exerciseIds
    .map((eid) => data.exercises.find((e) => e.id === eid))
    .filter(Boolean) as { id: string; name: string }[]

  const setDropTarget = (target: string | null) => {
    overIdRef.current = target
    setOverId(target)
  }

  const endDrag = (commit: boolean) => {
    const drag = dragRef.current
    const target = overIdRef.current
    if (commit && drag?.moved && target && drag.id !== target) {
      setExerciseIds((ids) => {
        const from = ids.indexOf(drag.id)
        const to = ids.indexOf(target)
        if (from < 0 || to < 0) return ids
        const next = [...ids]
        const [item] = next.splice(from, 1)
        next.splice(to, 0, item)
        return next
      })
    }
    dragRef.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setToast('请填写模板名称')
      return
    }
    if (!exerciseIds.length) {
      setToast('请至少添加一个动作')
      return
    }
    if (isNew) {
      addTemplate(trimmed, exerciseIds)
      setToast('模板已创建')
    } else if (id) {
      updateTemplate(id, { name: trimmed, exerciseIds })
      setToast('模板已保存')
    }
    window.setTimeout(() => navigate('/library?tab=templates'), 700)
  }

  return (
    <>
      <AppHeader title="Library" />
      <main className="bg-surface px-page pb-6">
        <div className="flex items-center justify-between gap-3 py-3">
          <Link
            to="/library?tab=templates"
            className="flex items-center gap-1 text-sm font-medium text-on-surface-variant"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            返回
          </Link>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container"
          >
            保存
          </button>
        </div>

        <div className="flex flex-col gap-card">
          <input
            className="w-full rounded-xl border border-transparent bg-[#f1f1f0] px-element py-3 text-[20px] font-semibold outline-none transition placeholder:text-on-surface/40 focus:border-on-surface focus:ring-4 focus:ring-primary/30"
            placeholder="模板名称（如：胸肩）"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="mt-2 flex flex-col gap-1">
            {rows.map((ex) => (
              <div
                key={ex.id}
                data-tpl-ex-id={ex.id}
                className={`flex items-center justify-between rounded-xl border bg-surface-container-lowest p-element transition-shadow ${
                  draggingId === ex.id
                    ? 'scale-[0.98] border-primary/50 opacity-60 shadow-md'
                    : overId === ex.id
                      ? 'border-primary border-dashed'
                      : 'border-on-surface/10'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <button
                    type="button"
                    title="拖拽排序"
                    className="flex h-8 w-8 touch-none cursor-grab items-center justify-center text-on-surface-variant active:cursor-grabbing"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      ;(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId)
                      dragRef.current = { id: ex.id, startY: e.clientY, moved: false }
                    }}
                    onPointerMove={(e) => {
                      const drag = dragRef.current
                      if (!drag || drag.id !== ex.id) return
                      if (!drag.moved && Math.abs(e.clientY - drag.startY) < 8) return
                      drag.moved = true
                      setDraggingId(ex.id)
                      const el = document.elementFromPoint(e.clientX, e.clientY)
                      const card = el?.closest('[data-tpl-ex-id]') as HTMLElement | null
                      const targetId = card?.dataset.tplExId
                      if (targetId && targetId !== ex.id) setDropTarget(targetId)
                      else setDropTarget(null)
                    }}
                    onPointerUp={() => endDrag(true)}
                    onPointerCancel={() => endDrag(false)}
                  >
                    <Icon name="drag_indicator" className="text-[20px]" />
                  </button>
                  <h3 className="truncate text-[20px] font-semibold">{ex.name}</h3>
                </div>
                <button
                  type="button"
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-error"
                  aria-label="移除动作"
                  onClick={() => setExerciseIds((ids) => ids.filter((x) => x !== ex.id))}
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
            ))}

            {!rows.length && (
              <p className="py-6 text-center text-sm text-on-surface-variant">
                还没有动作，点下方添加
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-2 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-on-surface/20 py-4 text-primary transition-colors hover:border-primary hover:bg-primary/5 active:translate-y-0.5 active:scale-[0.98]"
          >
            <Icon name="add_circle" className="text-[24px]" />
            <span className="text-base">添加动作</span>
          </button>
        </div>
      </main>

      {pickerOpen && (
        <ExercisePicker
          excludeIds={exerciseIds}
          onClose={() => setPickerOpen(false)}
          onPick={(exerciseId) => {
            setExerciseIds((ids) => (ids.includes(exerciseId) ? ids : [...ids, exerciseId]))
            setPickerOpen(false)
            setToast('已加入模板')
          }}
          onCreate={(exerciseName) => {
            const ex = upsertExercise(exerciseName)
            setExerciseIds((ids) => (ids.includes(ex.id) ? ids : [...ids, ex.id]))
            setPickerOpen(false)
            setToast(`已新增并加入「${ex.name}」`)
          }}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}

function ExercisePicker({
  excludeIds,
  onClose,
  onPick,
  onCreate,
}: {
  excludeIds: string[]
  onClose: () => void
  onPick: (id: string) => void
  onCreate: (name: string) => void
}) {
  const { data } = useStore()
  const [q, setQ] = useState('')
  const matches = useMemo(() => {
    const query = q.trim().toLowerCase()
    return data.exercises
      .filter((e) => !e.archived && !excludeIds.includes(e.id))
      .filter((e) => !query || e.name.toLowerCase().includes(query))
      .slice(0, 30)
  }, [data.exercises, excludeIds, q])

  const exact = matches.some((m) => m.name === q.trim())
  const showCreate = q.trim().length > 0 && !exact

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
              className="flex w-full items-center px-element py-3 text-left hover:bg-surface-container-low"
              onClick={() => onPick(ex.id)}
            >
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <Icon name="fitness_center" className="text-[16px]" />
              </div>
              <span className="flex-1 truncate text-base">{ex.name}</span>
              <Icon name="add_circle" className="text-[20px] text-primary" />
            </button>
          ))}
          {showCreate && (
            <div className="border-t border-on-surface/5 p-element">
              <button
                type="button"
                className="flex w-full flex-col items-center gap-2 rounded-xl border border-primary-container bg-primary-container/30 p-4"
                onClick={() => onCreate(q.trim())}
              >
                <Icon name="library_add" className="text-primary" />
                <span>
                  确认新增「<b className="text-primary">{q.trim()}</b>」并加入模板
                </span>
              </button>
            </div>
          )}
          {!matches.length && !showCreate && (
            <p className="p-8 text-center text-sm text-on-surface-variant">没有可添加的动作</p>
          )}
        </div>
      </div>
    </div>
  )
}
