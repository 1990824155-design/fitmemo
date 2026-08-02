import { useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import {
  EXPORT_SOFT_LIMIT,
  EXPORT_WARN_LIMIT,
  buildTextExport,
  filterByRange,
} from '../lib/exportPrompt'
import { exportJson, importJson } from '../lib/storage'
import { useStore } from '../lib/store'

type Format = 'text' | 'json'
type Range = '7' | '30' | 'all'

export function MorePage() {
  const { data, replaceAll } = useStore()
  const [range, setRange] = useState<Range>('7')
  const [format, setFormat] = useState<Format>('text')
  const [toast, setToast] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<{
    text: string
    fileName: string
  } | null>(null)

  const preview = useMemo(() => {
    if (format === 'json') {
      return JSON.stringify(
        {
          workouts: filterByRange(data.workouts, range),
          weights: filterByRange(data.weights, range),
          measurements: filterByRange(data.measurements, range),
          bodyFat: filterByRange(data.bodyFat, range),
        },
        null,
        2,
      )
    }
    return buildTextExport(data, range)
  }, [data, range, format])

  const charCount = preview.length
  const lengthHint =
    charCount >= EXPORT_WARN_LIMIT
      ? '偏长：部分 AI 对话可能粘贴不全，建议改选「近 7/30 天」或改用 JSON 分段。'
      : charCount >= EXPORT_SOFT_LIMIT
        ? '较长：一般模型仍可接受；若粘贴失败，缩小日期范围。'
        : '长度通常没问题（剪贴板与主流 AI 粘贴都够用）。'

  return (
    <>
      <AppHeader title="More" />
      <main className="bg-surface px-page pb-6">
        <div className="pt-6 pb-4">
          <h1 className="text-[32px] leading-10 font-bold tracking-tight">更多</h1>
          <p className="mt-1 text-sm text-on-surface-variant">导出、备份与即将推出的功能。</p>
        </div>

        <section className="mb-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-4 shadow-sm">
          <h2 className="mb-3 text-[20px] font-semibold">导出数据</h2>

          <label className="mb-1 block text-xs font-bold tracking-wider text-outline uppercase">
            日期范围
          </label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="mb-4 w-full rounded-xl bg-surface-container-low px-3 py-2 outline-none"
          >
            <option value="7">近 7 天</option>
            <option value="30">近 30 天</option>
            <option value="all">全部</option>
          </select>

          <label className="mb-1 block text-xs font-bold tracking-wider text-outline uppercase">
            Format
          </label>
          <div className="mb-4 flex gap-1 rounded-xl bg-surface-container p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                format === 'text' ? 'bg-surface-container-lowest shadow-sm' : ''
              }`}
              onClick={() => setFormat('text')}
            >
              Text + Prompt
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                format === 'json' ? 'bg-surface-container-lowest shadow-sm' : ''
              }`}
              onClick={() => setFormat('json')}
            >
              JSON
            </button>
          </div>

          <div
            className={`mb-3 rounded-xl px-3 py-2 text-xs ${
              charCount >= EXPORT_WARN_LIMIT
                ? 'bg-error-container text-on-error-container'
                : charCount >= EXPORT_SOFT_LIMIT
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            <div className="font-semibold">约 {charCount.toLocaleString()} 字</div>
            <div className="mt-0.5">{lengthHint}</div>
          </div>

          <pre className="mb-4 max-h-56 overflow-auto rounded-xl bg-surface-container-low p-3 text-xs whitespace-pre-wrap text-on-surface-variant">
            {preview}
          </pre>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container py-3 font-semibold"
            onClick={async () => {
              await navigator.clipboard.writeText(preview)
              setToast(
                charCount >= EXPORT_WARN_LIMIT
                  ? '已复制（内容较长，粘贴到 AI 时请留意是否截断）'
                  : '已复制到剪贴板',
              )
            }}
          >
            <Icon name="content_copy" />
            复制到剪贴板
          </button>
        </section>

        <section className="mb-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-4">
          <h2 className="mb-2 flex items-center gap-2 text-[20px] font-semibold">
            <Icon name="cloud_sync" />
            备份与恢复
          </h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            数据仅保存在本机浏览器。建议定期导出 JSON 备份；清缓存会丢数据。
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="rounded-xl border border-on-surface/15 py-3 font-semibold hover:bg-surface-container-low"
              onClick={async () => {
                await navigator.clipboard.writeText(exportJson(data))
                setToast('完整备份 JSON 已复制')
              }}
            >
              导出完整备份
            </button>
            <label className="cursor-pointer rounded-xl bg-surface-container py-3 text-center font-semibold hover:bg-surface-container-high">
              导入备份 JSON
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  try {
                    const text = await file.text()
                    // 先解析校验，再弹确认（避免 await 后 window.confirm 被浏览器吞掉）
                    importJson(text)
                    setPendingImport({ text, fileName: file.name })
                  } catch {
                    setToast('导入失败：文件无效')
                  }
                }}
              />
            </label>
          </div>
        </section>

        <section className="mb-4 rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-6 text-center">
          <div className="mb-2 text-4xl">👨‍🍳🔍</div>
          <h2 className="text-[20px] font-semibold">饮食记录</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            正在酝酿中：记饮食、看宏量、平衡一下。
          </p>
          <p className="mt-3 text-sm font-semibold text-primary">即将推出</p>
        </section>
      </main>

      {pendingImport && (
        <div className="fixed inset-y-0 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-on-surface/40 p-page backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-on-surface/10 bg-surface-container-lowest shadow-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
                <Icon name="warning" />
              </div>
              <h3 className="mb-2 text-[20px] font-semibold">确认导入备份？</h3>
              <p className="mb-2 text-sm text-on-surface-variant">
                将覆盖当前浏览器内的全部 FitMemo 数据，且无法撤销。
              </p>
              <p className="mb-6 truncate text-sm font-medium text-on-surface">
                {pendingImport.fileName}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="h-12 flex-1 rounded-xl bg-surface-container text-base font-medium"
                  onClick={() => setPendingImport(null)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="h-12 flex-1 rounded-xl bg-error text-base font-medium text-on-primary"
                  onClick={() => {
                    try {
                      replaceAll(importJson(pendingImport.text))
                      setPendingImport(null)
                      setToast('导入成功')
                    } catch {
                      setPendingImport(null)
                      setToast('导入失败：文件无效')
                    }
                  }}
                >
                  确认覆盖
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}
