import { useState, useEffect } from 'react'
import { Minus, Square, X } from 'lucide-react'

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (cb: (maximized: boolean) => void) => void
    }
  }
}

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)
  const api = window.electronAPI

  useEffect(() => {
    if (!api) return
    api.isMaximized().then(setMaximized)
    api.onMaximizeChange(setMaximized)
  }, [api])

  if (!api) return null

  return (
    <div
      className="flex items-center justify-between h-8 px-3 select-none shrink-0"
      style={{ background: '#0a0a1a', WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <span
        className="text-xs text-gray-500 font-medium tracking-wider pl-2"
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
          className="w-8 h-6 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="最小化"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={() => api.maximize()}
          className="w-8 h-6 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
          title={maximized ? '还原' : '最大化'}
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          onClick={() => api.close()}
          className="w-8 h-6 flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-500/60 rounded transition-colors"
          title="关闭"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}