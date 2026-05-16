import { memo } from 'react'
import { motion } from 'framer-motion'
import KnowledgeCard from './KnowledgeCard'
import type { KnowledgeCard as KnowledgeCardType } from '@/types'
import { cn } from '@/lib/utils'

interface KnowledgeGridProps {
  cards: KnowledgeCardType[]
  viewMode: 'grid' | 'list'
  hasAnyCards: boolean
  onCardClick?: (card: KnowledgeCardType) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

const KnowledgeGrid = memo(function KnowledgeGrid({ cards, viewMode, hasAnyCards, onCardClick }: KnowledgeGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="text-6xl mb-4 opacity-30">✦</div>
        <p className="text-lg">{hasAnyCards ? '没有匹配的卡片' : '暂无知识卡片'}</p>
        <p className="text-sm mt-1 opacity-60">
          {hasAnyCards ? '尝试调整筛选条件或搜索关键词' : '点击右下角按钮创建你的第一张卡片'}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
      )}
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={itemVariants}>
          <KnowledgeCard card={card} />
        </motion.div>
      ))}
    </motion.div>
  )
})

export default KnowledgeGrid