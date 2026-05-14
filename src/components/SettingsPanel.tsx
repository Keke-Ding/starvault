import { useRef, useCallback, useEffect } from 'react'
import { X, Upload, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { THEME_PRESETS, FONT_PRESETS } from '@/types'
import { cn } from '@/lib/utils'

const PRESET_BG_COLORS = [
  { name: '深空', value: '#0f0f1a' },
  { name: '星云紫', value: '#1a0a2e' },
  { name: '暗夜蓝', value: '#0a1628' },
  { name: '墨绿', value: '#0a1a0f' },
  { name: '暖橙', value: '#1a0f0a' },
  { name: '樱花粉', value: '#1a0a1a' },
  { name: '石墨', value: '#1a1a1a' },
  { name: '极光', value: '#0a1a1a' },
]

export default function SettingsPanel() {
  const settings = useStore((s) => s.settings)
  const isSettingsOpen = useStore((s) => s.isSettingsOpen)
  const updateSettings = useStore((s) => s.updateSettings)
  const closeSettings = useStore((s) => s.closeSettings)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.fontFamily = settings.fontFamily
  }, [settings.fontFamily])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        updateSettings({ backgroundImage: reader.result as string })
      }
      reader.readAsDataURL(file)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [updateSettings]
  )

  const handleClearBackground = useCallback(() => {
    updateSettings({ backgroundImage: null })
  }, [updateSettings])

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSettings}
          />

          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-80 overflow-y-auto"
            style={{
              background: 'rgba(15, 15, 26, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(0, 240, 255, 0.15)',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold neon-text-cyan tracking-wider">
                设置
              </h2>
              <button
                onClick={closeSettings}
                className="rounded-lg p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-cyan-400 mb-3 tracking-wide">
                  背景设置
                </h3>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                      'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
                      'hover:bg-cyan-500/20 hover:border-cyan-500/40'
                    )}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    上传背景图
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {settings.backgroundImage && (
                    <button
                      onClick={handleClearBackground}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        'bg-red-500/10 text-red-400 border border-red-500/20',
                        'hover:bg-red-500/20 hover:border-red-500/40'
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      清除背景
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">透明度</span>
                    <span className="text-xs text-cyan-400 tabular-nums">
                      {Math.round(settings.backgroundOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.01"
                    value={settings.backgroundOpacity}
                    onChange={(e) =>
                      updateSettings({
                        backgroundOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(0,240,255,0.3), rgba(0,240,255,1) ${((settings.backgroundOpacity - 0.3) / 0.7) * 100}%, rgba(255,255,255,0.1) ${((settings.backgroundOpacity - 0.3) / 0.7) * 100}%)`,
                      accentColor: '#00f0ff',
                    }}
                  />
                </div>

                <div>
                  <span className="text-xs text-gray-400 block mb-2">
                    预设背景色
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_BG_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          updateSettings({ backgroundImage: null })
                        }}
                        className="w-7 h-7 rounded-full border-2 border-white/15 transition-all hover:scale-110 hover:border-cyan-400/50"
                        style={{
                          backgroundColor: color.value,
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-cyan-400 mb-3 tracking-wide">
                  字体设置
                </h3>
                <div className="space-y-2">
                  {FONT_PRESETS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => updateSettings({ fontFamily: font.cssFamily })}
                      className={cn(
                        'w-full rounded-lg p-3 text-left transition-all',
                        'bg-white/5 border',
                        settings.fontFamily === font.cssFamily
                          ? 'neon-border'
                          : 'border-white/5 hover:border-white/15 hover:bg-white/8'
                      )}
                    >
                      <p
                        className="text-sm font-medium text-gray-200"
                        style={{ fontFamily: font.cssFamily }}
                      >
                        {font.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {font.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-cyan-400 mb-3 tracking-wide">
                  主题配色
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ themeId: theme.id })}
                      className={cn(
                        'rounded-lg p-3 transition-all',
                        'border',
                        settings.themeId === theme.id
                          ? 'neon-border bg-white/10'
                          : 'border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/8'
                      )}
                    >
                      <div className="flex gap-1.5 mb-2">
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: theme.bgColor }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-200">
                        {theme.name}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        {theme.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}