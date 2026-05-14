import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pencil, Trash2, ArrowLeft, Tag, Clock, Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '@/store/useStore'

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const cards = useStore((s) => s.cards)
  const deleteCard = useStore((s) => s.deleteCard)

  const card = cards.find((c) => c.id === id)

  if (!card) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex flex-col items-center justify-center gap-6"
      >
        <p className="text-xl text-gray-400">卡片未找到</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
      </motion.div>
    )
  }

  const formattedCreated = new Date(card.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const formattedUpdated = new Date(card.updatedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const handleDelete = () => {
    deleteCard(card.id)
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen px-6 py-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/editor/${card.id}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
            title="编辑卡片"
          >
            <Pencil className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10 transition-colors"
            title="删除卡片"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold neon-text-cyan text-neon-cyan mb-6">
        {card.title}
      </h1>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="px-3 py-1 text-sm rounded-full bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/20">
          {card.category}
        </span>

        {card.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-neon-cyan/60" />
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs rounded-full bg-neon-cyan/10 text-neon-cyan/80 border border-neon-cyan/15"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
          <Calendar className="w-3.5 h-3.5" />
          创建于 {formattedCreated}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          更新于 {formattedUpdated}
        </span>
      </div>

      <div className="glass-panel rounded-xl p-8">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {card.content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  )
}