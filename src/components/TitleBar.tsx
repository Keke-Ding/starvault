import { useState, useEffect } from 'react'
import { Minus, Square, X } from 'lucide-react'

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (cb: (maximized: boolean) => void) => () => void
    }
  }
}

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)
  const api = window.electronAPI

  useEffect(() => {
    if (!api) return
    api.isMaximized().then(setMaximized)
    const unsubscribe = api.onMaximizeChange(setMaximized)
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [api])

  if (!api) return null

  const btnBase =
    'w-12 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors'

  return (
    <div
      className="flex items-center justify-between h-9 px-2 select-none shrink-0"
      style={{ background: '#0a0a1a', WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <span
        className="text-xs text-gray-500 font-medium tracking-wider pl-3"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        星穹智识 StarVault
      </span>
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={() => api.minimize()}
          className={btnBase + ' hover:bg-white/10'}
          title="最小化"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => api.maximize()}
          className={btnBase + ' hover:bg-white/10'}
          title={maximized ? '还原' : '最大化'}
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => api.close()}
          className={btnBase + ' hover:bg-red-500/80'}
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}