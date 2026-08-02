import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AddExerciseSheet } from '../components/AddExerciseSheet'
import { ExerciseHistoryPanel } from '../components/ExerciseHistoryPanel'
import { TemplateSheet } from '../components/TemplateSheet'
import { Toast } from '../components/Toast'
import { Icon } from '../components/Icon'
import { formatCnDate } from '../lib/dates'
import { useStore } from '../lib/store'
import {
  SET_KG,
  SET_REPS,
  acceptNumberInput,
  isValidNumber,
} from '../lib/validate'
import { validateWorkoutForSave } from '../lib/workoutSave'

export function WorkoutEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    data,
    updateWorkout,
    addSet,
    updateSet,
    removeSet,
    removeExerciseFromWorkout,
    reorderWorkoutExercises,
    saveWorkoutDay,
  } = useStore()

  const workout = useMemo(
    () => data.workouts.find((w) => w.id === id) ?? null,
    [data.workouts, id],
  )

  const [addOpen, setAddOpen] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [invalidSets, setInvalidSets] = useState<Set<string>>(new Set())
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

  const setDropTarget = (target: string | null) => {
    overIdRef.current = target
    setOverId(target)
  }

  const endDrag = (commit: boolean) => {
    const drag = dragRef.current
    const target = overIdRef.current
    if (commit && drag?.moved && target && workout) {
      reorderWorkoutExercises(workout.id, drag.id, target)
    } else if (drag && !drag.moved) {
      setMenuId((mid) => (mid === drag.id ? null : drag.id))
    }
    dragRef.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  if (!workout) {
    return (
      <>
        <AppHeader title="编辑训练" />
        <main className="bg-surface px-page pb-6">
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="text-[20px] font-semibold">找不到这条训练</p>
            <Link to="/timeline" className="text-sm font-semibold text-primary">
              返回时间线
            </Link>
          </div>
        </main>
      </>
    )
  }

  const dateInfo = formatCnDate(workout.date)

  return (
    <>
      <AppHeader title="编辑训练" />
      <main className="bg-surface px-page pb-6">
        <div className="flex flex-col space-y-3 pt-6 pb-4">
          <button
            type="button"
            className="flex w-max items-center gap-1 text-sm text-on-surface-variant hover:text-primary"
            onClick={() => navigate('/timeline')}
          >
            <Icon name="arrow_back" className="text-[18px]" />
            时间线
          </button>

          <input
            className="w-full bg-transparent text-[24px] leading-8 font-semibold outline-none"
            value={workout.focus}
            placeholder="部位日名称"
            onChange={(e) => updateWorkout(workout.id, { focus: e.target.value })}
          />

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2">
              <Icon name="calendar_month" className="shrink-0 text-on-surface-variant" />
              <input
                type="date"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                value={workout.date}
                onChange={(e) => {
                  const next = e.target.value
                  if (!next || next === workout.date) return
                  const res = updateWorkout(workout.id, { date: next })
                  if (!res.ok) setToast(res.reason)
                  else setToast(`日期已改为 ${formatCnDate(next).withWeek}`)
                }}
              />
            </label>
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
          {workout.exercises.map((ex, idx) => (
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
                          removeExerciseFromWorkout(workout.id, ex.id)
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
                  excludeWorkoutId={workout.id}
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
                        updateSet(ex.id, set.id, { weightKg: next }, workout.id)
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
                        updateSet(ex.id, set.id, { reps: next }, workout.id)
                      }}
                    />
                    <button
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant ${
                        ex.sets.length <= 1
                          ? 'invisible'
                          : 'hover:bg-error-container hover:text-error'
                      }`}
                      aria-label="删除本组"
                      disabled={ex.sets.length <= 1}
                      onClick={() => removeSet(ex.id, set.id, workout.id)}
                    >
                      <Icon name="close" className="text-[16px]" />
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
                onClick={() => addSet(ex.id, workout.id)}
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
            value={workout.performance ?? 7}
            onChange={(v) => updateWorkout(workout.id, { performance: v })}
          />
          <SliderRow
            icon="battery_horiz_050"
            label="疲劳度"
            value={workout.fatigue ?? 5}
            onChange={(v) => updateWorkout(workout.id, { fatigue: v })}
          />

          <div>
            <label className="mb-2 flex items-center gap-2 text-base">
              <Icon name="edit_note" className="text-tertiary" />
              训练备注
            </label>
            <textarea
              className="min-h-24 w-full resize-none rounded-xl bg-surface-container-low p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="当天状态、器械、特殊情况…"
              value={workout.note}
              onChange={(e) => updateWorkout(workout.id, { note: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-on-primary"
            onClick={() => {
              const err = validateWorkoutForSave(workout.exercises)
              if (err) {
                pendingNavRef.current = null
                setInvalidSets(new Set(err.invalidSetIds))
                setToast(err.message)
                return
              }

              setInvalidSets(new Set())
              saveWorkoutDay(workout.id)
              pendingNavRef.current = '/timeline'
              setToast('已保存')
            }}
          >
            <Icon name="save" />
            保存修改
          </button>
        </div>
      </main>

      <AddExerciseSheet
        open={addOpen}
        workoutId={workout.id}
        onClose={() => setAddOpen(false)}
        onToast={setToast}
      />
      <TemplateSheet
        open={tplOpen}
        workoutId={workout.id}
        onClose={() => setTplOpen(false)}
        onToast={setToast}
      />
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
