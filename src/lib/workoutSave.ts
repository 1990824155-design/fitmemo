import { isSetEmpty, isSetFilled } from './sets'
import { fieldHint, isValidNumber } from './validate'
import type { WorkoutExercise } from './types'

export type WorkoutSaveError = {
  message: string
  invalidSetIds: string[]
}

/**
 * 保存前校验：完全空白的组忽略；每动作至少 1 组完整；
 * 只填了一半的组需补全或删除。
 */
export function validateWorkoutForSave(
  exercises: WorkoutExercise[],
): WorkoutSaveError | null {
  if (!exercises.length) {
    return { message: '请先添加至少一个动作', invalidSetIds: [] }
  }

  const invalidSetIds: string[] = []
  let message = '请把未填完的组补全，或删除该组'

  for (const ex of exercises) {
    const nonempty = ex.sets.filter((s) => !isSetEmpty(s))
    const filled = nonempty.filter(isSetFilled)
    const partial = nonempty.filter((s) => !isSetFilled(s))

    if (!filled.length && !partial.length) {
      return { message: `「${ex.name}」至少填写一组`, invalidSetIds: [] }
    }

    for (const set of partial) {
      invalidSetIds.push(set.id)
      if (set.weightKg !== '' && !isValidNumber('setKg', set.weightKg)) {
        message = fieldHint('setKg')
      } else if (set.reps !== '' && !isValidNumber('setReps', set.reps)) {
        message = fieldHint('setReps')
      }
    }

    if (!filled.length && partial.length) {
      return {
        message: `「${ex.name}」至少完整填写一组（或删除未填完的组）`,
        invalidSetIds,
      }
    }
  }

  if (invalidSetIds.length) {
    return { message, invalidSetIds }
  }
  return null
}
