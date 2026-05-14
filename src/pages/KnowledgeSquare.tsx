import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import Navbar from '@/components/Navbar'
import CategoryBar from '@/components/CategoryBar'
import KnowledgeCard from '@/components/KnowledgeCard'
import { cn } from '@/lib/utils'

export default function KnowledgeSquare() {
  const navigate = useNavigate()
  const cards = useStore((s) => s.cards)
  const searchQuery = useStore((s) => s.searchQuery)
  const activeCategory = useStore((s) => s.activeCategory)
  const viewMode = useStore((s) => s.settings.viewMode)

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesCategory =
        activeCategory === '全部' || card.category === activeCategory

      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        card.title.toLowerCase().includes(query) ||
        card.content.toLowerCase().includes(query) ||
        card.tags.some((tag) => tag.toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [cards, activeCategory, searchQuery])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen"
    >
      <Navbar />

      <div className="px-6">
        <CategoryBar />
      </div>

      <main className="px-6 pb-24 pt-4">
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <p className="text-lg">暂无匹配的知识卡片</p>
            <p className="text-sm mt-2">尝试调整搜索条件或创建新卡片</p>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
            )}
          >
            {filteredCards.map((card) => (
              <KnowledgeCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </main>

      <motion.button
        onClick={() => navigate('/editor')}
        className={cn(
          'fixed bottom-8 right-8 z-40',
          'flex items-center justify-center',
          'w-14 h-14 rounded-full',
          'bg-neon-cyan/15 border border-neon-cyan/40',
          'text-neon-cyan',
          'shadow-[0_0_20px_rgba(0,240,255,0.3)]',
          'hover:bg-neon-cyan/25 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]',
          'transition-all duration-300'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="创建新卡片"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
  )
}