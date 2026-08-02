/** 训练组重量 kg（允许 0，自重/弹力带） */
export const SET_KG = { min: 0, max: 500 } as const
/** 训练组次数 */
export const SET_REPS = { min: 1, max: 100 } as const
/** 体重 kg */
export const BODY_KG = { min: 20, max: 300 } as const
/** 围度 cm */
export const MEASURE_CM = { min: 10, max: 250 } as const
/** 体脂率 % */
export const BODY_FAT_PCT = { min: 1, max: 70 } as const
/** 肌肉量 kg */
export const MUSCLE_KG = { min: 5, max: 150 } as const

export type NumberField = 'setKg' | 'setReps' | 'bodyKg' | 'measureCm' | 'bodyFatPct' | 'muscleKg'

type Rule = { min: number; max: number; integer?: boolean; label: string }

const RULES: Record<NumberField, Rule> = {
  setKg: { ...SET_KG, label: '重量(kg)' },
  setReps: { ...SET_REPS, integer: true, label: '次数' },
  bodyKg: { ...BODY_KG, label: '体重(kg)' },
  measureCm: { ...MEASURE_CM, label: '围度(cm)' },
  bodyFatPct: { ...BODY_FAT_PCT, label: '体脂率(%)' },
  muscleKg: { ...MUSCLE_KG, label: '肌肉量(kg)' },
}

/**
 * 输入时过滤：返回可写入的 number | ''；null 表示拒绝（负数/超大/非法）。
 * 允许未超过 max 的中间态（如 0、12.）。
 */
export function acceptNumberInput(
  field: NumberField,
  raw: string,
): number | '' | null {
  if (raw === '') return ''
  const rule = RULES[field]
  if (raw === '-' || raw === '+') return null
  if (rule.integer) {
    if (!/^\d+$/.test(raw)) return null
    const n = Number(raw)
    if (n > rule.max) return null
    return n
  }
  // 允许末尾小数点，便于输入 58.5
  if (/^\d+\.$/.test(raw)) {
    const head = Number(raw.slice(0, -1))
    if (!Number.isFinite(head) || head > rule.max) return null
    return head
  }
  if (!/^\d+(\.\d*)?$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0 || n > rule.max) return null
  return n
}

/** 字符串受控输入：非法则返回 null（调用方不更新） */
export function acceptRawInput(field: NumberField, raw: string): string | null {
  if (raw === '') return ''
  const rule = RULES[field]
  if (raw === '-' || raw === '+') return null
  if (rule.integer) {
    if (!/^\d+$/.test(raw)) return null
    if (Number(raw) > rule.max) return null
    return raw
  }
  if (/^\d+\.$/.test(raw)) {
    if (Number(raw.slice(0, -1)) > rule.max) return null
    return raw
  }
  if (!/^\d+(\.\d*)?$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n > rule.max) return null
  return raw
}

export function isValidNumber(field: NumberField, value: number | ''): boolean {
  if (value === '') return false
  const rule = RULES[field]
  if (!Number.isFinite(value)) return false
  if (rule.integer && !Number.isInteger(value)) return false
  return value >= rule.min && value <= rule.max
}

export function isValidRaw(field: NumberField, raw: string): boolean {
  if (raw === '') return false
  const n = Number(raw)
  return isValidNumber(field, n)
}

export function fieldHint(field: NumberField): string {
  const rule = RULES[field]
  if (rule.integer) return `${rule.label}需为 ${rule.min}–${rule.max} 的整数`
  return `${rule.label}需在 ${rule.min}–${rule.max} 之间`
}

export function fieldAttrs(field: NumberField) {
  const rule = RULES[field]
  return {
    min: rule.min,
    max: rule.max,
    step: rule.integer ? 1 : 'any',
  } as const
}
