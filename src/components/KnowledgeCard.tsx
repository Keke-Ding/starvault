import { useNavigate } from 'react-router-dom'
import { Tag, Clock } from 'lucide-react'
import type { KnowledgeCard as KnowledgeCardType } from '@/types'
import { cn } from '@/lib/utils'

interface KnowledgeCardProps {
  card: KnowledgeCardType
  onClick?: () => void
}

export default function KnowledgeCard({ card, onClick }: KnowledgeCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    onClick?.()
    navigate(`/detail/${card.id}`)
  }

  const formattedDate = new Date(card.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <article
      onClick={handleClick}
      className={cn(
        'clip-slant cursor-pointer overflow-hidden',
        'bg-void-light/50 backdrop-blur-md',
        'border border-white/5',
        'card-hover-effect',
        'hover:border-neon-cyan/30 hover:shadow-[0_12px_40px_rgba(0,240,255,0.15),0_0_20px_rgba(0,240,255,0.1)]'
      )}
    >
      <div className="p-5 flex flex-col h-full gap-3">
        <h3 className="text-lg font-bold text-neon-cyan truncate neon-text-cyan">
          {card.title}
        </h3>

        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
          {card.content}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <Tag className="w-3.5 h-3.5 text-neon-cyan/60 shrink-0 mt-0.5" />
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-neon-cyan/10 text-neon-cyan/80 border border-neon-cyan/15"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="px-2.5 py-0.5 text-xs rounded-full bg-neon-magenta/10 text-neon-magenta/80 border border-neon-magenta/15">
            {card.category}
          </span>

          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  )
}