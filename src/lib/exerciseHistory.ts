import { formatCnDate } from './dates'
import { isSetFilled } from './sets'
import type { AppData, SetRow, WorkoutExercise } from './types'

export type ExerciseHistoryEntry = {
  workoutId: string
  date: string
  dateLabel: string
  focus: string
  entry: WorkoutExercise
  sets: SetRow[]
}

/** 该动作在各训练日的历史（新→旧），排除指定训练日 */
export function historyForExercise(
  data: AppData,
  exerciseId: string,
  excludeWorkoutId?: string,
): ExerciseHistoryEntry[] {
  const rows: ExerciseHistoryEntry[] = []
  for (const w of data.workouts) {
    if (excludeWorkoutId && w.id === excludeWorkoutId) continue
    const entry = w.exercises.find((e) => e.exerciseId === exerciseId)
    if (!entry) continue
    const sets = entry.sets.filter(isSetFilled)
    if (!sets.length) continue
    rows.push({
      workoutId: w.id,
      date: w.date,
      dateLabel: formatCnDate(w.date).short,
      focus: w.focus,
      entry,
      sets,
    })
  }
  rows.sort((a, b) => b.date.localeCompare(a.date))
  return rows
}
