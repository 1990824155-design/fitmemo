import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { Toast } from '../components/Toast'
import { useStore } from '../lib/store'
import type { Exercise } from '../lib/types'

const BODY_TAGS = ['胸', '肩', '背', '臂', '臀腿', '核心', '有氧'] as const

export function LibraryPage() {
  const {
    data,
    upsertExercise,
    updateExercise,
    deleteExercise,
    deleteTemplate,
    addExerciseToToday,
  } = useStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [editingEx, setEditingEx] = useState<Exercise | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftTags, setDraftTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  const tab: 'exercises' | 'templates' =
    searchParams.get('tab') === 'templates' ? 'templates' : 'exercises'

  const setTab = (next: 'exercises' | 'templates') => {
    if (next === 'templates') setSearchParams({ tab: 'templates' }, { replace: true })
    else setSearchParams({}, { replace: true })
  }

  const openEditor = (ex: Exercise) => {
    setEditingEx(ex)
    setDraftName(ex.name)
    setDraftTags([...ex.tags])
    setCustomTag('')
  }

  const toggleTag = (tag: string) => {
    setDraftTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const saveEditor = () => {
    if (!editingEx) return
    const name = draftName.trim()
    if (!name) {
      setToast('动作名不能为空')
      return
    }
    const ok = updateExercise(editingEx.id, { name, tags: draftTags })
    if (!ok) {
      setToast(`已有同名动作「${name}」`)
      return
    }
    setEditingEx(null)
    setToast(name !== editingEx.name ? '已更新名称与部位' : '部位已更新')
  }

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return data.exercises
      .filter((e) => !e.archived)
      .filter((e) => !query || e.name.toLowerCase().includes(query) || e.tags.some((t) => t.includes(query)))
  }, [data.exercises, q])

  return (
    <>
      <AppHeader title="Library" />
      <main className="bg-surface px-page pb-6">
        <div className="pt-6 pb-4">
          <h1 className="text-[32px] leading-10 font-bold tracking-tight">动作库</h1>
          <p className="mt-1 text-sm text-on-surface-variant">管理动作与部位日模板。</p>
        </div>

        <div className="mb-4 flex gap-2 rounded-xl bg-surface-container p-1">
          {(
            [
              ['exercises', '动作'],
              ['templates', '模板'],
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

        {tab === 'exercises' && (
          <>
            <div className="relative mb-4">
              <Icon
                name="search"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-on-surface-variant/50"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索动作…"
                className="h-11 w-full rounded-xl border border-transparent bg-surface-container-low pr-3 pl-9 outline-none focus:border-on-surface"
              />
            </div>

            {q.trim() && !list.some((e) => e.name === q.trim()) && (
              <button
                type="button"
                className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-primary-container bg-primary-container/40 p-4"
                onClick={() => {
                  upsertExercise(q.trim())
                  setToast(`已新增「${q.trim()}」`)
                  setQ('')
                }}
              >
                <Icon name="library_add" className="text-primary" />
                <span>
                  确认新增「<b className="text-primary">{q.trim()}</b>」到动作库
                </span>
              </button>
            )}

            <div className="flex flex-col gap-2">
              {list.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                    <Icon name="fitness_center" />
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditor(ex)}
                    className="min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-1 truncate font-semibold">
                      <span className="truncate">{ex.name}</span>
                      <Icon name="edit" className="shrink-0 text-[14px] text-outline opacity-70" />
                    </div>
                    <div className="mt-0.5 truncate text-sm text-on-surface-variant">
                      {ex.tags.length ? ex.tags.join(' · ') : '未分类'}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/5"
                    onClick={() => {
                      const ok = addExerciseToToday(ex)
                      setToast(ok ? `已加入今日：${ex.name}` : `今日已有「${ex.name}」`)
                    }}
                  >
                    加入今日
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-outline hover:bg-error/10 hover:text-error"
                    title="删除"
                    aria-label={`删除 ${ex.name}`}
                    onClick={() => {
                      if (
                        confirm(
                          `从动作库删除「${ex.name}」？\n历史训练记录仍保留；相关模板中会移除该动作。`,
                        )
                      ) {
                        deleteExercise(ex.id)
                        setToast(`已删除「${ex.name}」`)
                      }
                    }}
                  >
                    <Icon name="delete" className="text-[20px]" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'templates' && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant py-4 text-on-surface-variant hover:border-primary hover:text-primary"
              onClick={() => navigate('/library/templates/new')}
            >
              <Icon name="add" />
              新建模板
            </button>

            {data.templates.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => navigate(`/library/templates/${t.id}`)}
                  >
                    <h3 className="text-base font-semibold">{t.name}</h3>
                    <p className="text-sm text-on-surface-variant">{t.exerciseIds.length} 个动作</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="rounded-lg bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container"
                      onClick={() => navigate(`/library/templates/${t.id}`)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="text-outline hover:text-error"
                      onClick={() => {
                        if (confirm(`删除模板「${t.name}」？`)) deleteTemplate(t.id)
                      }}
                    >
                      <Icon name="delete" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.exerciseIds.map((eid) => {
                    const ex = data.exercises.find((e) => e.id === eid)
                    return (
                      <span
                        key={eid}
                        className="rounded-full bg-surface-variant px-2.5 py-1 text-xs"
                      >
                        {ex?.name ?? '已删除动作'}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingEx && (
        <div className="fixed inset-y-0 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 items-end bg-on-surface/30 p-page pb-safe backdrop-blur-sm sm:items-center">
          <div className="w-full overflow-hidden rounded-2xl border border-on-surface/10 bg-surface-container-lowest shadow-xl">
            <div className="border-b border-on-surface/5 px-page py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[20px] font-semibold">编辑动作</h3>
                  <p className="truncate text-sm text-on-surface-variant">改名与部位</p>
                </div>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant"
                  onClick={() => setEditingEx(null)}
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>
            </div>

            <div className="px-page py-4">
              <label className="mb-1 block text-xs font-bold tracking-wider text-outline uppercase">
                动作名称
              </label>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="mb-4 h-11 w-full rounded-xl bg-surface-container-low px-3 text-base outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="动作名"
              />

              <p className="mb-3 text-xs font-bold tracking-wider text-outline uppercase">
                选择部位（可多选）
              </p>
              <div className="flex flex-wrap gap-2">
                {BODY_TAGS.map((tag) => {
                  const on = draftTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                        on
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
                {draftTags
                  .filter((t) => !(BODY_TAGS as readonly string[]).includes(t))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="rounded-full bg-primary-container px-3 py-1.5 text-sm font-semibold text-on-primary-container"
                    >
                      {tag} ×
                    </button>
                  ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="自定义部位…"
                  className="h-10 flex-1 rounded-xl bg-surface-container-low px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    const t = customTag.trim()
                    if (!t) return
                    if (!draftTags.includes(t)) setDraftTags((prev) => [...prev, t])
                    setCustomTag('')
                  }}
                />
                <button
                  type="button"
                  className="rounded-xl bg-surface-container px-3 text-sm font-semibold"
                  onClick={() => {
                    const t = customTag.trim()
                    if (!t) return
                    if (!draftTags.includes(t)) setDraftTags((prev) => [...prev, t])
                    setCustomTag('')
                  }}
                >
                  添加
                </button>
              </div>
            </div>

            <div className="flex gap-3 border-t border-on-surface/5 px-page py-4">
              <button
                type="button"
                className="h-12 flex-1 rounded-xl bg-surface-container text-base font-medium"
                onClick={() => setEditingEx(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="h-12 flex-1 rounded-xl bg-primary text-base font-medium text-on-primary"
                onClick={saveEditor}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}
