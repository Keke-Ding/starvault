import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FloatingButton() {
  const navigate = useNavigate()

  return (
    <motion.button
      onClick={() => navigate('/editor')}
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className={cn(
        'fixed bottom-8 right-8 z-50',
        'clip-diamond',
        'w-14 h-14',
        'flex items-center justify-center',
        'bg-neon-magenta/20',
        'border border-neon-magenta/50',
        'text-neon-magenta',
        'animate-pulse-neon',
        'cursor-pointer',
        'shadow-[0_0_20px_rgba(255,45,149,0.3)]',
      )}
      aria-label="新建知识卡片"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  )
}