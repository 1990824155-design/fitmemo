import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AddExerciseSheet } from '../components/AddExerciseSheet'
import { ExerciseHistoryPanel } from '../components/ExerciseHistoryPanel'
import { TemplateSheet } from '../components/TemplateSheet'
import { Toast } from '../components/Toast'
import { Icon } from '../components/Icon'
import { formatCnDate, todayKey } from '../lib/dates'
import { useStore } from '../lib/store'
import {
  SET_KG,
  SET_REPS,
  acceptNumberInput,
  isValidNumber,
} from '../lib/validate'
import { validateWorkoutForSave } from '../lib/workoutSave'

const EMPTY_EMOJIS = ['🧘‍♀️', '🏋️‍♂️', '💪', '🤸‍♀️', '🏃‍♀️']

export function TodayPage() {
  const {
    today,
    ensureToday,
    updateToday,
    addSet,
    updateSet,
    removeSet,
    removeExerciseFromToday,
    reorderTodayExercises,
    saveWorkoutDay,
  } = useStore()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [invalidSets, setInvalidSets] = useState<Set<string>>(new Set())
  const [emoji, setEmoji] = useState(0)
  const pendingNavRef = useRef<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const overIdRef = useRef<string | null>(null)
  const dragRef = useRef<{
    id: string
    startY: number
    moved: boolean
  } | null>(null)

  useEffect(() => {
    if (!menuId) return
    const close = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-exercise-menu]')) return
      setMenuId(null)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menuId])

  const setDropTarget = (id: string | null) => {
    overIdRef.current = id
    setOverId(id)
  }

  const endDrag = (commit: boolean) => {
    const drag = dragRef.current
    const target = overIdRef.current
    if (commit && drag?.moved && target) {
      reorderTodayExercises(drag.id, target)
    } else if (drag && !drag.moved) {
      setMenuId((id) => (id === drag.id ? null : drag.id))
    }
    dragRef.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  const dateInfo = formatCnDate(todayKey())
  const hasSession = Boolean(today && (today.exercises.length > 0 || today.focus || today.savedAt))

  if (!hasSession) {
    return (
      <>
        <AppHeader title="Today" />
        <main className="bg-surface px-page pb-6">
          <div className="mt-6 mb-4 flex flex-col gap-1">
            <span className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
              {dateInfo.longCaps}
            </span>
            <input
              className="w-full bg-transparent text-[32px] leading-10 font-bold tracking-tight outline-none placeholder:text-on-surface/40"
              placeholder="今日部位日…"
              onChange={(e) => {
                ensureToday(e.target.value)
                updateToday({ focus: e.target.value })
              }}
            />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16">
            <button
              type="button"
              className="relative flex h-32 w-32 items-center justify-center rounded-full border border-on-surface/10 bg-surface-container"
              onClick={() => setEmoji((e) => (e + 1) % EMPTY_EMOJIS.length)}
            >
              <span className="relative z-10 text-6xl transition-transform active:scale-90">
                {EMPTY_EMOJIS[emoji]}
              </span>
              <div className="absolute inset-0 scale-90 rounded-full bg-primary/20 blur-xl" />
            </button>
            <div className="max-w-[260px] px-4 text-center">
              <h2 className="text-[20px] font-semibold">还没有记录组数</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                身体是庙宇，也可能是沙发。开练吧。
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4 pb-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-primary-container py-4 text-[20px] font-semibold active:translate-x-px active:translate-y-px"
              onClick={() => setAddOpen(true)}
            >
              <Icon name="play_arrow" filled />
              开始训练
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-on-surface/20 py-3 text-base hover:bg-surface-container-low"
              onClick={() => setTplOpen(true)}
            >
              <Icon name="library_add" />
              套用模板
            </button>
          </div>
        </main>
        <AddExerciseSheet open={addOpen} onClose={() => setAddOpen(false)} onToast={setToast} />
        <TemplateSheet open={tplOpen} onClose={() => setTplOpen(false)} onToast={setToast} />
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </>
    )
  }

  return (
    <>
      <AppHeader title="Today" />
      <main className="bg-surface px-page pb-6">
        <div className="flex flex-col space-y-2 pt-8 pb-4">
          <div className="flex items-center justify-between gap-3">
            <input
              className="min-w-0 flex-1 bg-transparent text-[24px] leading-8 font-semibold outline-none"
              value={today?.focus ?? ''}
              placeholder="部位日名称"
              onChange={(e) => updateToday({ focus: e.target.value })}
            />
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-full border border-on-surface/10 px-3 py-1.5 hover:bg-surface-variant"
              onClick={() => setTplOpen(true)}
            >
              <Icon name="auto_awesome_mosaic" className="text-[16px] text-on-surface-variant" />
              <span className="text-xs font-bold tracking-wider text-on-surface-variant">
                套用模板
              </span>
            </button>
          </div>
          <div className="text-sm text-outline">{dateInfo.withWeek}</div>
        </div>

        <div className="flex flex-col gap-card">
          {today?.exercises.map((ex, idx) => (
            <div
              key={ex.id}
              data-exercise-id={ex.id}
              className={`relative rounded-[16px] border bg-surface-container-lowest p-element shadow-sm transition-all ${
                draggingId === ex.id
                  ? 'scale-[0.98] opacity-50 border-primary/40'
                  : overId === ex.id
                    ? 'border-primary border-dashed'
                    : 'border-on-surface/10'
              }`}
            >
              <div
                className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-[16px] ${
                  idx % 2 === 0 ? 'bg-primary/20' : 'bg-secondary/20'
                }`}
              />
              <div className="flex items-start justify-between pl-2">
                <div className="min-w-0 flex-1">
                  <h2 className="text-[20px] font-semibold">
                    {ex.name}
                    {ex.bilateral && (
                      <span className="ml-2 align-middle rounded-full bg-secondary-container px-2 py-0.5 text-xs font-medium text-on-secondary-container">
                        双边
                      </span>
                    )}
                  </h2>
                </div>
                <div className="relative" data-exercise-menu>
                  <button
                    type="button"
                    title="拖拽排序 · 轻点删除"
                    aria-label="拖拽排序或打开删除菜单"
                    className="flex h-8 w-8 touch-none cursor-grab items-center justify-center rounded-full text-outline select-none active:cursor-grabbing hover:bg-surface-variant hover:text-on-surface"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      ;(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId)
                      dragRef.current = { id: ex.id, startY: e.clientY, moved: false }
                      setMenuId(null)
                    }}
                    onPointerMove={(e) => {
                      const drag = dragRef.current
                      if (!drag || drag.id !== ex.id) return
                      if (!drag.moved && Math.abs(e.clientY - drag.startY) < 8) return
                      drag.moved = true
                      setDraggingId(ex.id)
                      const el = document.elementFromPoint(e.clientX, e.clientY)
                      const card = el?.closest('[data-exercise-id]') as HTMLElement | null
                      const targetId = card?.dataset.exerciseId
                      if (targetId && targetId !== ex.id) setDropTarget(targetId)
                      else setDropTarget(null)
                    }}
                    onPointerUp={() => endDrag(true)}
                    onPointerCancel={() => endDrag(false)}
                  >
                    <Icon name="more_vert" className="text-[20px]" />
                  </button>
                  {menuId === ex.id && (
                    <div className="absolute top-9 right-0 z-20 min-w-[96px] rounded-xl border border-error/10 bg-surface-container-lowest p-1 shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-1 rounded-lg bg-error-container px-3 py-2 text-sm font-semibold text-on-error-container"
                        onClick={() => {
                          removeExerciseFromToday(ex.id)
                          setMenuId(null)
                          setToast(`已删除「${ex.name}」`)
                        }}
                      >
                        <Icon name="delete" className="text-[16px]" />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <ExerciseHistoryPanel
                  exerciseId={ex.exerciseId}
                  excludeWorkoutId={today?.id}
                />
              </div>

              <div className="mt-1 flex flex-col">
                <div className="mb-1 grid grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-2 border-b border-on-surface/5 px-1 pb-2 text-xs font-bold tracking-wider text-outline uppercase">
                  <span className="text-center">组</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">次数</span>
                  <span />
                </div>
                {ex.sets.map((set, si) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-2 rounded-lg px-1 py-2 hover:bg-surface-variant/30"
                  >
                    <span className="text-center text-sm text-on-surface-variant">{si + 1}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={SET_KG.min}
                      max={SET_KG.max}
                      step="0.25"
                      className={`w-full min-w-0 border-b bg-transparent pb-1 text-center text-base outline-none focus:border-primary ${
                        invalidSets.has(set.id) && !isValidNumber('setKg', set.weightKg)
                          ? 'border-error bg-error-container/40'
                          : 'border-transparent'
                      }`}
                      value={set.weightKg}
                      onChange={(e) => {
                        const next = acceptNumberInput('setKg', e.target.value)
                        if (next === null) return
                        setInvalidSets((prev) => {
                          if (!prev.has(set.id)) return prev
                          const copy = new Set(prev)
                          copy.delete(set.id)
                          return copy
                        })
                        updateSet(ex.id, set.id, { weightKg: next })
                      }}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min={SET_REPS.min}
                      max={SET_REPS.max}
                      step={1}
                      className={`w-full min-w-0 border-b bg-transparent pb-1 text-center text-base outline-none focus:border-primary ${
                        invalidSets.has(set.id) && !isValidNumber('setReps', set.reps)
                          ? 'border-error bg-error-container/40'
                          : 'border-transparent'
                      }`}
                      value={set.reps}
                      onChange={(e) => {
                        const next = acceptNumberInput('setReps', e.target.value)
                        if (next === null) return
                        setInvalidSets((prev) => {
                          if (!prev.has(set.id)) return prev
                          const copy = new Set(prev)
                          copy.delete(set.id)
                          return copy
                        })
                        updateSet(ex.id, set.id, { reps: next })
                      }}
                    />
                    <button
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        ex.sets.length <= 1
                          ? 'invisible'
                          : 'text-on-surface-variant hover:bg-error-container hover:text-error'
                      }`}
                      aria-label="删除本组"
                      disabled={ex.sets.length <= 1}
                      onClick={() => removeSet(ex.id, set.id)}
                    >
                      <Icon name="close" className="text-[18px]" />
                    </button>
                  </div>
                ))}
              </div>

              {ex.note && (
                <div className="-mx-2 mt-2 flex items-center gap-2 rounded-lg bg-surface-variant/30 px-2 py-2">
                  <span>😫</span>
                  <span className="text-sm text-on-surface-variant italic">{ex.note}</span>
                </div>
              )}

              <button
                type="button"
                className="mt-2 flex w-max items-center gap-2 rounded-lg px-2 py-2 text-sm text-primary hover:bg-primary/5"
                onClick={() => addSet(ex.id)}
              >
                <Icon name="add" className="text-[18px]" />
                添加一组
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 flex w-full flex-col items-center justify-center gap-1 rounded-[16px] border-2 border-dashed border-outline-variant bg-surface-container-lowest py-4 text-base text-on-surface-variant hover:border-primary hover:bg-primary/5 hover:text-primary"
          onClick={() => setAddOpen(true)}
        >
          <Icon name="add_circle" className="text-[24px]" />
          添加动作
        </button>

        <div className="my-4 h-px bg-on-surface/5" />

        <div className="flex flex-col space-y-6 pb-8">
          <SliderRow
            icon="sentiment_very_satisfied"
            label="表现评分"
            value={today?.performance ?? 7}
            onChange={(v) => updateToday({ performance: v })}
          />
          <SliderRow
            icon="battery_horiz_050"
            label="疲劳度"
            value={today?.fatigue ?? 5}
            onChange={(v) => updateToday({ fatigue: v })}
          />

          <div>
            <label className="mb-2 flex items-center gap-2 text-base">
              <Icon name="edit_note" className="text-tertiary" />
              训练备注
            </label>
            <textarea
              className="min-h-24 w-full resize-none rounded-xl bg-surface-container-low p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="今天状态如何？遇到了什么问题？"
              value={today?.note ?? ''}
              onChange={(e) => updateToday({ note: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-on-primary"
            onClick={() => {
              const exercises = today?.exercises ?? []
              const err = validateWorkoutForSave(exercises)
              if (err) {
                pendingNavRef.current = null
                setInvalidSets(new Set(err.invalidSetIds))
                setToast(err.message)
                return
              }

              setInvalidSets(new Set())
              saveWorkoutDay()
              pendingNavRef.current = '/timeline'
              setToast('提交成功')
            }}
          >
            <Icon name="save" />
            结束并保存
          </button>
        </div>
      </main>
      <AddExerciseSheet open={addOpen} onClose={() => setAddOpen(false)} onToast={setToast} />
      <TemplateSheet open={tplOpen} onClose={() => setTplOpen(false)} onToast={setToast} />
      {toast && (
        <Toast
          message={toast}
          onDone={() => {
            setToast(null)
            const to = pendingNavRef.current
            pendingNavRef.current = null
            if (to) navigate(to)
          }}
        />
      )}
    </>
  )
}

function SliderRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: string
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-base">
          <Icon name={icon} className="text-tertiary" />
          {label}
        </label>
        <span className="text-[20px] font-semibold text-primary">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  )
}
