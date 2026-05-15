import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, LayoutGrid, List, Settings } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const searchQuery = useStore((s) => s.searchQuery)
  const viewMode = useStore((s) => s.settings.viewMode)
  const setSearchQuery = useStore((s) => s.setSearchQuery)
  const updateSettings = useStore((s) => s.updateSettings)
  const toggleSettings = useStore((s) => s.toggleSettings)

  const [focused, setFocused] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearch(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
    }, 250)
  }, [setSearchQuery])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const handleViewToggle = () => {
    updateSettings({ viewMode: viewMode === 'grid' ? 'list' : 'grid' })
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(15, 15, 26, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
        boxShadow: '0 4px 24px rgba(0, 240, 255, 0.06)',
      }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <h1 className="neon-text-cyan text-xl font-bold tracking-wider select-none">
          星穹智识
        </h1>
      </div>

      <div className="relative flex-1 max-w-md mx-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="搜索知识卡片..."
          className={cn(
            'w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all duration-300',
            'bg-white/5 text-gray-200 placeholder:text-gray-500',
            focused
              ? 'neon-border'
              : 'border border-white/10'
          )}
        />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleViewToggle}
          className="rounded-lg p-2 text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
          title={viewMode === 'grid' ? '切换到列表视图' : '切换到网格视图'}
        >
          {viewMode === 'grid' ? (
            <List className="h-5 w-5" />
          ) : (
            <LayoutGrid className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={toggleSettings}
          className="rounded-lg p-2 text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
          title="设置"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}