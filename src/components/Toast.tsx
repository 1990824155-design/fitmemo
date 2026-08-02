import { useEffect } from 'react'

export function Toast({
  message,
  onDone,
  duration = 1600,
}: {
  message: string
  onDone: () => void
  duration?: number
}) {
  useEffect(() => {
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [onDone, duration, message])

  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[80] w-max max-w-md -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-sm font-medium text-surface shadow-lg">
      {message}
    </div>
  )
}
