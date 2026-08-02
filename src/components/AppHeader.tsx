import { Icon } from './Icon'

export function AppHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-surface/95 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex h-16 items-center justify-between px-page">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="FitMemo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-[20px] font-semibold leading-7">{title}</span>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
          <Icon name="person" className="text-[18px]" />
        </div>
      </div>
    </header>
  )
}
