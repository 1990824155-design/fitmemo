import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { todayKey } from '../lib/dates'
import { uid } from '../lib/id'
import { useStore } from '../lib/store'
import type { AppData } from '../lib/types'
import {
  BODY_FAT_PCT,
  BODY_KG,
  MEASURE_CM,
  MUSCLE_KG,
  acceptRawInput,
  fieldHint,
  isValidRaw,
} from '../lib/validate'

type Tab = 'weight' | 'measure' | 'fat'

export function BodyPage() {
  const { data, replaceAll } = useStore()
  const [tab, setTab] = useState<Tab>('weight')
  const [toast, setToast] = useState<string | null>(null)
  const [date, setDate] = useState(todayKey())
  const [kg, setKg] = useState('')
  const [fat, setFat] = useState('')
  const [muscle, setMuscle] = useState('')
  const [measures, setMeasures] = useState({
    chest: '',
    waist: '',
    hip: '',
    arm: '',
    thigh: '',
    calf: '',
  })

  const patch = (fn: (d: AppData) => void) => {
    const next = structuredClone(data)
    fn(next)
    replaceAll(next)
  }

  return (
    <>
      <AppHeader title="Body" />
      <main className="bg-surface px-page pb-6">
        <div className="pt-6 pb-4">
          <h1 className="text-[32px] leading-10 font-bold tracking-tight">身体关照</h1>
          <p className="mt-1 text-sm text-on-surface-variant">体重、围度与体脂，随手记。</p>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl bg-surface-container p-1">
          {(
            [
              ['weight', '体重'],
              ['measure', '围度'],
              ['fat', '体脂'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                tab === key ? 'bg-surface-container-lowest shadow-sm' : 'text-on-surface-variant'
              }`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-4">
          <label className="mb-2 block text-xs font-bold tracking-wider text-outline uppercase">
            日期
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-4 w-full rounded-xl bg-surface-container-low px-3 py-2 outline-none"
          />

          {tab === 'weight' && (
            <>
              <label className="mb-2 block text-xs font-bold tracking-wider text-outline uppercase">
                体重 (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={BODY_KG.min}
                max={BODY_KG.max}
                step="0.1"
                value={kg}
                onChange={(e) => {
                  const next = acceptRawInput('bodyKg', e.target.value)
                  if (next !== null) setKg(next)
                }}
                className="mb-4 w-full rounded-xl bg-surface-container-low px-3 py-3 text-[20px] outline-none"
                placeholder="例如 58.5"
              />
              <button
                type="button"
                className="w-full rounded-xl bg-primary-container py-3 font-semibold"
                onClick={() => {
                  if (!isValidRaw('bodyKg', kg)) {
                    setToast(fieldHint('bodyKg'))
                    return
                  }
                  patch((d) => {
                    d.weights.unshift({ id: uid('wt'), date, kg: Number(kg) })
                  })
                  setKg('')
                  setToast('已记录体重')
                }}
              >
                保存体重
              </button>
            </>
          )}

          {tab === 'measure' && (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3">
                {(
                  [
                    ['chest', '胸围'],
                    ['waist', '腰围'],
                    ['hip', '臀围'],
                    ['arm', '臂围'],
                    ['thigh', '腿围'],
                    ['calf', '小腿围'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="text-sm">
                    <span className="mb-1 block text-on-surface-variant">{label} cm</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={MEASURE_CM.min}
                      max={MEASURE_CM.max}
                      step="0.1"
                      value={measures[key]}
                      onChange={(e) => {
                        const next = acceptRawInput('measureCm', e.target.value)
                        if (next === null) return
                        setMeasures((m) => ({ ...m, [key]: next }))
                      }}
                      className="w-full rounded-xl bg-surface-container-low px-3 py-2 outline-none"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-primary-container py-3 font-semibold"
                onClick={() => {
                  const keys = ['chest', 'waist', 'hip', 'arm', 'thigh', 'calf'] as const
                  for (const key of keys) {
                    const raw = measures[key]
                    if (raw !== '' && !isValidRaw('measureCm', raw)) {
                      setToast(fieldHint('measureCm'))
                      return
                    }
                  }
                  const entry = {
                    id: uid('ms'),
                    date,
                    chest: numOrU(measures.chest),
                    waist: numOrU(measures.waist),
                    hip: numOrU(measures.hip),
                    arm: numOrU(measures.arm),
                    thigh: numOrU(measures.thigh),
                    calf: numOrU(measures.calf),
                  }
                  if (
                    entry.chest == null &&
                    entry.waist == null &&
                    entry.hip == null &&
                    entry.arm == null &&
                    entry.thigh == null &&
                    entry.calf == null
                  ) {
                    setToast('请至少填写一项围度')
                    return
                  }
                  patch((d) => d.measurements.unshift(entry))
                  setToast('已记录围度')
                }}
              >
                保存围度
              </button>
            </>
          )}

          {tab === 'fat' && (
            <>
              <label className="mb-2 block text-sm text-on-surface-variant">体脂率 %</label>
              <input
                type="number"
                inputMode="decimal"
                min={BODY_FAT_PCT.min}
                max={BODY_FAT_PCT.max}
                step="0.1"
                value={fat}
                onChange={(e) => {
                  const next = acceptRawInput('bodyFatPct', e.target.value)
                  if (next !== null) setFat(next)
                }}
                className="mb-3 w-full rounded-xl bg-surface-container-low px-3 py-2 outline-none"
              />
              <label className="mb-2 block text-sm text-on-surface-variant">肌肉量 kg（可选）</label>
              <input
                type="number"
                inputMode="decimal"
                min={MUSCLE_KG.min}
                max={MUSCLE_KG.max}
                step="0.1"
                value={muscle}
                onChange={(e) => {
                  const next = acceptRawInput('muscleKg', e.target.value)
                  if (next !== null) setMuscle(next)
                }}
                className="mb-4 w-full rounded-xl bg-surface-container-low px-3 py-2 outline-none"
              />
              <button
                type="button"
                className="w-full rounded-xl bg-primary-container py-3 font-semibold"
                onClick={() => {
                  if (!isValidRaw('bodyFatPct', fat)) {
                    setToast(fieldHint('bodyFatPct'))
                    return
                  }
                  if (muscle !== '' && !isValidRaw('muscleKg', muscle)) {
                    setToast(fieldHint('muscleKg'))
                    return
                  }
                  patch((d) =>
                    d.bodyFat.unshift({
                      id: uid('bf'),
                      date,
                      bodyFatPct: Number(fat),
                      muscleKg: muscle ? Number(muscle) : undefined,
                    }),
                  )
                  setFat('')
                  setMuscle('')
                  setToast('已记录体脂')
                }}
              >
                保存体脂
              </button>
            </>
          )}
        </div>

        <h2 className="mb-3 flex items-center gap-2 text-[20px] font-semibold">
          <Icon name="timeline" />
          最近记录
        </h2>
        <div className="flex flex-col gap-2">
          {tab === 'weight' &&
            data.weights.slice(0, 10).map((w) => (
              <Row
                key={w.id}
                title={`${w.kg} kg`}
                sub={w.date}
                onDelete={() => patch((d) => (d.weights = d.weights.filter((x) => x.id !== w.id)))}
              />
            ))}
          {tab === 'measure' &&
            data.measurements.slice(0, 10).map((m) => (
              <Row
                key={m.id}
                title={[
                  m.chest != null && `胸 ${m.chest}`,
                  m.waist != null && `腰 ${m.waist}`,
                  m.hip != null && `臀 ${m.hip}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                sub={m.date}
                onDelete={() =>
                  patch((d) => (d.measurements = d.measurements.filter((x) => x.id !== m.id)))
                }
              />
            ))}
          {tab === 'fat' &&
            data.bodyFat.slice(0, 10).map((b) => (
              <Row
                key={b.id}
                title={`${b.bodyFatPct}%${b.muscleKg != null ? ` · 肌肉 ${b.muscleKg}kg` : ''}`}
                sub={b.date}
                onDelete={() => patch((d) => (d.bodyFat = d.bodyFat.filter((x) => x.id !== b.id)))}
              />
            ))}
        </div>
      </main>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}

function numOrU(v: string) {
  return v === '' ? undefined : Number(v)
}

function Row({
  title,
  sub,
  onDelete,
}: {
  title: string
  sub: string
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-on-surface/10 bg-surface-container-lowest px-4 py-3">
      <div>
        <div className="font-semibold">{title || '—'}</div>
        <div className="text-sm text-on-surface-variant">{sub}</div>
      </div>
      <button type="button" className="text-outline hover:text-error" onClick={onDelete}>
        <Icon name="delete" />
      </button>
    </div>
  )
}
