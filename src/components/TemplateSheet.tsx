import { useStore } from '../lib/store'
import { Icon } from './Icon'

type Props = {
  open: boolean
  onClose: () => void
  onToast: (msg: string) => void
  /** 不传则套用到今日 */
  workoutId?: string
}

export function TemplateSheet({ open, onClose, onToast, workoutId }: Props) {
  const { data, applyTemplate } = useStore()
  if (!open) return null

  const targetLabel = workoutId ? '该日训练' : '今日'

  return (
    <div className="fixed inset-y-0 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 items-end bg-on-surface/30 backdrop-blur-sm">
      <div className="w-full rounded-t-[24px] bg-surface p-page pb-safe shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold">套用模板</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-variant"
          >
            <Icon name="close" />
          </button>
        </div>
        <p className="mb-4 text-sm text-on-surface-variant">
          默认追加到{targetLabel}已有动作，不覆盖。
        </p>
        <div className="flex flex-col gap-3 pb-4">
          {data.templates.map((t) => (
            <button
              key={t.id}
              type="button"
              className="flex items-center justify-between rounded-2xl border border-on-surface/10 bg-surface-container-lowest p-4 text-left hover:bg-primary-container/40"
              onClick={() => {
                applyTemplate(t, workoutId)
                onToast(`已追加模板「${t.name}」到${targetLabel}`)
                onClose()
              }}
            >
              <div>
                <div className="text-base font-semibold">{t.name}</div>
                <div className="text-sm text-on-surface-variant">{t.exerciseIds.length} 个动作</div>
              </div>
              <Icon name="add" className="text-primary" />
            </button>
          ))}
          {!data.templates.length && (
            <p className="py-6 text-center text-sm text-on-surface-variant">暂无模板，可在动作库里创建。</p>
          )}
        </div>
      </div>
    </div>
  )
}
