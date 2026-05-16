import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useShallow } from 'zustand/shallow'
import { useStore } from '@/store/useStore'
import Navbar from '@/components/Navbar'
import CategoryBar from '@/components/CategoryBar'
import KnowledgeGrid from '@/components/KnowledgeGrid'
import FloatingButton from '@/components/FloatingButton'

export default function KnowledgeSquare() {
  const { cards, searchQuery, activeCategory, viewMode } = useStore(
    useShallow((s) => ({
      cards: s.cards,
      searchQuery: s.searchQuery,
      activeCategory: s.activeCategory,
      viewMode: s.settings.viewMode,
    }))
  )

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

      <div className="px-3 sm:px-6 lg:px-8 max-w-[1800px] mx-auto w-full">
        <CategoryBar />
        <main className="py-4 sm:py-6">
          <KnowledgeGrid cards={filteredCards} viewMode={viewMode} hasAnyCards={cards.length > 0} />
        </main>
      </div>

      <FloatingButton />
    </motion.div>
  )
}