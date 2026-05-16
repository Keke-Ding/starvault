import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Save, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '@/store/useStore'
import { DEFAULT_CATEGORIES } from '@/types'
import { cn } from '@/lib/utils'

export default function CardEditor() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const cards = useStore((s) => s.cards)
  const addCard = useStore((s) => s.addCard)
  const updateCard = useStore((s) => s.updateCard)

  const existingCard = id ? cards.find((c) => c.id === id) : undefined
  const isEditing = !!existingCard

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[1])
  const [tagsText, setTagsText] = useState('')
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [titleFocused, setTitleFocused] = useState(false)
  const [contentFocused, setContentFocused] = useState(false)

  useEffect(() => {
    if (existingCard) {
      setTitle(existingCard.title)
      setCategory(existingCard.category)
      setTagsText(existingCard.tags.join(', '))
      setContent(existingCard.content)
    }
  }, [existingCard])

  const handleSave = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (isEditing && existingCard) {
      updateCard(existingCard.id, {
        title: trimmedTitle,
        category,
        tags,
        content,
      })
    } else {
      addCard({
        title: trimmedTitle,
        category,
        tags,
        content,
      })
    }

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
        <h1 className="text-2xl font-bold neon-text-cyan text-neon-cyan">
          {isEditing ? '编辑卡片' : '创建新卡片'}
        </h1>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
          取消
        </button>
      </div>

      <div className="glass-panel rounded-xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              placeholder="输入卡片标题..."
              className={cn(
                'w-full rounded-lg py-3 px-4 text-lg outline-none transition-all duration-300',
                'bg-white/5 text-gray-200 placeholder:text-gray-500',
                titleFocused
                  ? 'neon-border'
                  : 'border border-white/10'
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(
                  'w-full rounded-lg py-3 px-4 outline-none transition-all duration-300',
                  'bg-white/5 text-gray-200 border border-white/10',
                  'focus:neon-border appearance-none cursor-pointer'
                )}
              >
                {DEFAULT_CATEGORIES.filter((c) => c !== '全部').map((cat) => (
                  <option key={cat} value={cat} className="bg-void">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                标签（逗号分隔）
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="例如：React, TypeScript, 前端"
                className={cn(
                  'w-full rounded-lg py-3 px-4 outline-none transition-all duration-300',
                  'bg-white/5 text-gray-200 placeholder:text-gray-500',
                  'border border-white/10 focus:neon-border'
                )}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">
                内容（Markdown）
              </label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
                  showPreview
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                    : 'text-gray-400 border border-white/10 hover:text-neon-cyan hover:border-neon-cyan/30'
                )}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    关闭预览
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    预览
                  </>
                )}
              </button>
            </div>

            {showPreview ? (
              <div className="border border-white/10 rounded-lg p-6 min-h-[300px] max-h-[600px] overflow-y-auto">
                {content.trim() ? (
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">暂无内容可预览</p>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setContentFocused(true)}
                onBlur={() => setContentFocused(false)}
                placeholder="使用 Markdown 格式编写内容..."
                rows={16}
                className={cn(
                  'w-full rounded-lg py-3 px-4 outline-none transition-all duration-300 resize-y',
                  'bg-white/5 text-gray-200 placeholder:text-gray-500',
                  'font-mono text-sm leading-relaxed',
                  contentFocused
                    ? 'neon-border'
                    : 'border border-white/10'
                )}
              />
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300',
                title.trim()
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/25 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                  : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4" />
              {isEditing ? '更新卡片' : '创建卡片'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}