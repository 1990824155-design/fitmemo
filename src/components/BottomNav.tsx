import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const items = [
  { to: '/', label: 'Today', icon: 'today', end: true },
  { to: '/timeline', label: 'Timeline', icon: 'history' },
  { to: '/library', label: 'Library', icon: 'fitness_center' },
  { to: '/body', label: 'Body', icon: 'monitoring' },
  { to: '/more', label: 'More', icon: 'more_horiz' },
] as const

export function BottomNav() {
  return (
    <nav className="z-50 w-full shrink-0 border-t border-on-surface/5 bg-surface/95 pb-safe backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} filled={isActive} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
                <div
                  className={`mt-0.5 h-1 w-1 rounded-full bg-primary transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
