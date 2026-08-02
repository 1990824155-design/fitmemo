import { useEffect, useState } from 'react'
import { historyForExercise } from '../lib/exerciseHistory'
import { useStore } from '../lib/store'

type Props = {
  exerciseId: string
  /** 当前正在编辑的训练日，历史列表中排除 */
  excludeWorkoutId?: string
}

export function ExerciseHistoryPanel({ exerciseId, excludeWorkoutId }: Props) {
  const { data } = useStore()
  const history = historyForExercise(data, exerciseId, excludeWorkoutId)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [exerciseId, excludeWorkoutId, history.length])

  if (!history.length) {
    return (
      <p className="pl-2 text-sm text-outline">暂无历史参考</p>
    )
  }

  const safeIndex = Math.min(index, history.length - 1)
  const current = history[safeIndex]
  const canPrev = safeIndex < history.length - 1
  const canNext = safeIndex > 0

  const label =
    safeIndex === 0
      ? `上一次记录 (${current.dateLabel})`
      : `历史记录 (${current.dateLabel})`

  return (
    <div className="pl-2">
      <div className="mb-2 rounded-lg bg-surface-variant/20 p-2">
        <div className="mb-1 flex w-full items-center justify-between">
          <button
            type="button"
            disabled={!canPrev}
            aria-label="更早的记录"
            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
            onClick={() => setIndex((i) => Math.min(i + 1, history.length - 1))}
          >
            <ChevronLeft />
          </button>
          <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
            {label}
          </span>
          <button
            type="button"
            disabled={!canNext}
            aria-label="更新的记录"
            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {current.sets.map((set, i) => (
            <div
              key={set.id}
              className="flex items-center text-[12px] text-on-surface-variant"
            >
              <span className="w-8">{i + 1}</span>
              <span className="flex-1 text-center">{set.weightKg} kg</span>
              <span className="flex-1 text-center">{set.reps} 次</span>
            </div>
          ))}
        </div>
        {history.length > 1 && (
          <p className="mt-1.5 text-center text-[10px] text-outline">
            {safeIndex + 1} / {history.length}
          </p>
        )}
      </div>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="16"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="16"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
