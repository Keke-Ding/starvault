import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import Navbar from '@/components/Navbar'
import CategoryBar from '@/components/CategoryBar'
import KnowledgeGrid from '@/components/KnowledgeGrid'
import FloatingButton from '@/components/FloatingButton'

export default function KnowledgeSquare() {
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
        <KnowledgeGrid cards={filteredCards} viewMode={viewMode} />
      </main>

      <FloatingButton />
    </motion.div>
  )
}