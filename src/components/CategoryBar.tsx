import { useRef, useEffect } from 'react'
import { DEFAULT_CATEGORIES } from '@/types'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function CategoryBar() {
  const activeCategory = useStore((s) => s.activeCategory)
  const setActiveCategory = useStore((s) => s.setActiveCategory)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto py-3 px-1 scrollbar-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {DEFAULT_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat
        return (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300',
              'border border-transparent',
              isActive
                ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-void-light/60 text-gray-400 hover:text-white hover:bg-void-lighter/80 hover:border-white/10'
            )}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}