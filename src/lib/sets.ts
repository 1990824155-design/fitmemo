import type { SetRow } from './types'
import { isValidNumber } from './validate'

/** 已填写完整的组 = 完成（无需打勾） */
export function isSetFilled(set: SetRow): boolean {
  return isValidNumber('setKg', set.weightKg) && isValidNumber('setReps', set.reps)
}

export function isSetEmpty(set: SetRow): boolean {
  return set.weightKg === '' && set.reps === ''
}

export function countFilledSets(sets: SetRow[]): number {
  return sets.filter(isSetFilled).length
}
