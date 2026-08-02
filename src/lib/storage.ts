import type { AppData } from './types'
import { createSeedData } from './seed'

/** v2：内置 timeline_journey 日记种子；换键以便本机/新访客加载完整历史 */
const KEY = 'fitmemo.v2'

function sanitize(data: AppData): AppData {
  // 清掉误创建的空训练日（无动作、无部位日、未保存）
  data.workouts = data.workouts.filter(
    (w) => w.exercises.length > 0 || Boolean(w.focus?.trim()) || Boolean(w.savedAt),
  )
  return data
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const seed = createSeedData()
      saveData(seed)
      return seed
    }
    const data = sanitize(JSON.parse(raw) as AppData)
    saveData(data)
    return data
  } catch {
    const seed = createSeedData()
    saveData(seed)
    return seed
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportJson(data: AppData) {
  return JSON.stringify(data, null, 2)
}

export function importJson(text: string): AppData {
  const parsed = JSON.parse(text) as AppData
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.exercises)) {
    throw new Error('无效的备份文件')
  }
  return parsed
}
