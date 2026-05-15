import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Pencil, Trash2, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '@/store/useStore'

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const cards = useStore((s) => s.cards)
  const deleteCard = useStore((s) => s.deleteCard)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const card = cards.find((c) => c.id === id)

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">卡片未找到</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    deleteCard(card.id)
    navigate('/')
  }

  const formattedCreated = new Date(card.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedUpdated = new Date(card.updatedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen py-6 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/editor/${card.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 transition-colors text-sm"
            >
              <Pencil className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold neon-text-cyan mb-4">
            {card.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-neon-magenta/10 text-neon-magenta/80 border border-neon-magenta/15">
              {card.category}
            </span>

            {card.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan/80 border border-neon-cyan/15"
              >
                {tag}
              </span>
            ))}

            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              创建于 {formattedCreated}
            </span>
            {formattedCreated !== formattedUpdated && (
              <span className="text-gray-600">
                · 更新于 {formattedUpdated}
              </span>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {card.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel rounded-xl p-6 max-w-sm w-full mx-4 border border-red-500/20"
          >
            <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
            <p className="text-gray-400 text-sm mb-6">
              确定要删除「{card.title}」吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}