export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatCnDate(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  return {
    short: `${m}月${d}日`,
    withWeek: `${m}月${d}日 · 周${week}`,
    longCaps: date
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })
      .toUpperCase(),
  }
}

export function monthLabel(dateKey: string) {
  const [y, m] = dateKey.split('-').map(Number)
  return `${y}年${m}月`
}
