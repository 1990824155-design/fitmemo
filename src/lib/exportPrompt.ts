import { isSetFilled } from './sets'
import type {
  AppData,
  BodyFatEntry,
  MeasurementEntry,
  WeightEntry,
  WorkoutDay,
} from './types'

/** 与 ios-app/docs/prompt.md 保持同步 */
export const AI_ANALYSIS_PROMPT = `你是一名循证力量训练教练与运动数据分析师。请仅基于我提供的 FitMemo 导出数据，生成个性化、可执行且安全的训练复盘与建议。

【分析原则】
- 先描述数据覆盖范围、训练频率与数据完整性；缺失信息必须明确说明，不能自行假设。
- 重点看同一动作的可比表现：重量、次数、组数、总训练量（重量×次数；仅在单位和动作一致时比较）、完成度、劳累度、备注。
- 区分“单次波动”和“持续趋势”：除非至少连续 2–3 次可比记录支持，否则不要断言进步、退步或平台期。
- 动作名称、器械、单双边、动作幅度、技术标准不同，不能直接横向比较；双边动作须说明重量口径不明确时的限制。
- 不把主观劳累度等同于 RPE/RIR；若没有接近力竭、睡眠、疼痛、饮食和训练目标等数据，请列为待确认项。
- 建议以渐进超负荷、动作质量、适当训练量与恢复为核心；避免承诺快速效果、诊断伤病或给出医疗建议。
- 若备注出现疼痛、麻木、头晕、关节不适或症状加重，优先建议停止诱发动作、降低负荷，并视情况咨询医生或合格康复/运动专业人士。

【请按以下结构输出】

# 1. 数据概览
- 分析期间：起止日期、训练天数、每周平均训练次数。
- 覆盖内容：训练部位、主要动作、是否有体重/围度/体脂数据。
- 数据质量：指出缺失、命名不一致、未完成组或无法比较之处。

# 2. 本周期训练总结
- 用 3–5 条要点总结训练规律、部位覆盖、动作重复度和训练连续性。
- 列出表现最稳定或最明确进步的动作，并用具体日期、重量、次数、组数作为依据。
- 指出值得关注的波动、停滞、完成度下降或劳累度持续偏高；说明证据是否充足。

# 3. 动作与训练量分析
按动作分别分析（只分析数据足够的动作）：
- 最近一次表现 vs 前 2–3 次可比训练。
- 重量、次数、组数及可比较的总训练量变化。
- 判断：可尝试进阶 / 维持巩固 / 降低负荷或组数 / 数据不足。
- 解释判断依据，避免只依据单次记录。

# 4. 下一次训练建议
按“优先级最高的 3–5 个动作”给出具体建议：
- 建议重量、目标次数范围、建议组数，以及进阶条件。
- 优先使用“双重渐进”：先在动作质量稳定的前提下提高次数；达到次数范围上限后，再小幅加重量并回到范围下限。
- 没有 RIR/RPE 数据时，建议保留约 1–3 次余力；复合动作、自由重量和技术不稳定动作应更保守。
- 若近期劳累度高、完成度下降或恢复不足，提供减量方案（例如减少 1–2 组、降低约 5–10% 负荷，或维持重量并减少次数），并说明何时恢复进阶。
- 不要为缺少历史数据的动作编造精确重量；给出保守起始范围和记录建议。

# 5. 计划层面的调整
- 评价当前训练频率、部位覆盖和动作安排是否与已有数据相符。
- 提出最多 3 项最值得执行的调整，并说明预期目的。
- 若无法判断目标（增肌、力量、减脂、健康）或恢复情况，先提出简短追问，而不是给出武断结论。

# 6. 下次应补充记录
列出最有价值的 3–5 项：例如每组是否接近力竭（RIR/RPE）、疼痛/不适、动作标准变化、睡眠恢复、体重趋势、训练目标。

【表达要求】
- 使用中文，语气支持但直接。
- 每个关键结论都引用对应数据；没有证据就说“数据不足”。
- 优先给出可在下一次训练执行的方案。
- 总字数控制在 800–1,200 字；最后用“本周最重要的一个行动”作一句总结。

以下是 FitMemo 导出数据：`

/** 软提示阈值（字符数，含中文） */
export const EXPORT_SOFT_LIMIT = 80_000
/** 多数对话模型粘贴仍较稳妥的区间 */
export const EXPORT_WARN_LIMIT = 120_000

export function filterByRange<T extends { date: string }>(
  items: T[],
  range: '7' | '30' | 'all',
): T[] {
  if (range === 'all') return items
  const days = range === '7' ? 7 : 30
  const from = new Date()
  from.setDate(from.getDate() - days)
  const y = from.getFullYear()
  const m = String(from.getMonth() + 1).padStart(2, '0')
  const d = String(from.getDate()).padStart(2, '0')
  const key = `${y}-${m}-${d}`
  return items.filter((i) => i.date >= key)
}

export function buildTextExport(
  data: Pick<AppData, 'workouts' | 'weights' | 'measurements' | 'bodyFat'>,
  range: '7' | '30' | 'all',
): string {
  const workouts = filterByRange(
    [...data.workouts]
      .filter((w) => w.exercises.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date)),
    range,
  )
  const weights = filterByRange(
    [...data.weights].sort((a, b) => a.date.localeCompare(b.date)),
    range,
  )
  const measurements = filterByRange(
    [...data.measurements].sort((a, b) => a.date.localeCompare(b.date)),
    range,
  )
  const bodyFat = filterByRange(
    [...data.bodyFat].sort((a, b) => a.date.localeCompare(b.date)),
    range,
  )

  const parts = [
    AI_ANALYSIS_PROMPT,
    '',
    '========== FitMemo 结构化数据 ==========',
    '',
    formatMeta(workouts, weights, measurements, bodyFat, range),
    '',
    '## 训练记录',
    formatWorkouts(workouts),
    '',
    '## 身体数据',
    formatBody(weights, measurements, bodyFat),
    '',
    '========== 数据结束 ==========',
  ]

  return parts.join('\n')
}

function formatMeta(
  workouts: WorkoutDay[],
  weights: WeightEntry[],
  measurements: MeasurementEntry[],
  bodyFat: BodyFatEntry[],
  range: string,
) {
  const dates = workouts.map((w) => w.date)
  const start = dates[0] ?? '—'
  const end = dates[dates.length - 1] ?? '—'
  return [
    `导出范围：${range === '7' ? '近7天' : range === '30' ? '近30天' : '全部'}`,
    `训练日数量：${workouts.length}`,
    `日期跨度：${start} ~ ${end}`,
    `体重记录：${weights.length} 条 · 围度：${measurements.length} 条 · 体脂：${bodyFat.length} 条`,
    `单位：重量 kg，次数为整数`,
  ].join('\n')
}

function formatWorkouts(workouts: WorkoutDay[]) {
  if (!workouts.length) return '(所选范围内暂无训练记录)'

  return workouts
    .map((w) => {
      const lines = [
        `### ${w.date} · ${w.focus || '未命名训练'}`,
        `- 完成度(表现)：${w.performance}/10`,
        `- 劳累度：${w.fatigue}/10`,
      ]
      if (w.note) lines.push(`- 训练备注：${w.note}`)
      if (w.savedAt) lines.push(`- 保存时间：${w.savedAt}`)

      w.exercises.forEach((ex, i) => {
        const filled = ex.sets.filter(isSetFilled)
        const volume = filled.reduce(
          (sum, s) => sum + Number(s.weightKg) * Number(s.reps),
          0,
        )
        lines.push('')
        lines.push(
          `${i + 1}. ${ex.name}${ex.bilateral ? ' [双边]' : ''} · ${filled.length}组 · 训练量 ${volume || 0}`,
        )
        filled.forEach((s, si) => {
          lines.push(`   组${si + 1}: ${s.weightKg} kg × ${s.reps}`)
        })
        if (ex.note) lines.push(`   动作备注：${ex.note}`)
      })

      return lines.join('\n')
    })
    .join('\n\n')
}

function formatBody(
  weights: WeightEntry[],
  measurements: MeasurementEntry[],
  bodyFat: BodyFatEntry[],
) {
  const blocks: string[] = []

  blocks.push('### 体重')
  if (!weights.length) blocks.push('(无)')
  else {
    for (const w of weights) blocks.push(`- ${w.date}: ${w.kg} kg`)
  }

  blocks.push('')
  blocks.push('### 围度 (cm)')
  if (!measurements.length) blocks.push('(无)')
  else {
    for (const m of measurements) {
      const parts = [
        m.chest != null && `胸 ${m.chest}`,
        m.waist != null && `腰 ${m.waist}`,
        m.hip != null && `臀 ${m.hip}`,
        m.arm != null && `臂 ${m.arm}`,
        m.thigh != null && `腿 ${m.thigh}`,
        m.calf != null && `小腿 ${m.calf}`,
      ].filter(Boolean)
      blocks.push(`- ${m.date}: ${parts.join(' · ') || '—'}`)
    }
  }

  blocks.push('')
  blocks.push('### 体脂')
  if (!bodyFat.length) blocks.push('(无)')
  else {
    for (const b of bodyFat) {
      const extra =
        b.muscleKg != null
          ? ` · 肌肉 ${b.muscleKg} kg${b.fatKg != null ? ` · 脂肪 ${b.fatKg} kg` : ''}`
          : b.fatKg != null
            ? ` · 脂肪 ${b.fatKg} kg`
            : ''
      blocks.push(`- ${b.date}: 体脂 ${b.bodyFatPct}%${extra}`)
    }
  }

  return blocks.join('\n')
}
