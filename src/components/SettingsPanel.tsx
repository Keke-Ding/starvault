import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Trash2, Download, FileInput } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { FONT_PRESETS, THEME_PRESETS } from '@/types'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  { label: '紫黑', value: '#0f0f1a' },
  { label: '樱紫', value: '#1a0a1a' },
  { label: '墨绿', value: '#0a1a0f' },
  { label: '棕橙', value: '#1a0f0a' },
  { label: '深蓝', value: '#0a0a2e' },
  { label: '暗红', value: '#1a0a0a' },
  { label: '纯黑', value: '#050508' },
  { label: '深灰', value: '#12121f' },
]

export default function SettingsPanel() {
  const isOpen = useStore((s) => s.isSettingsOpen)
  const settings = useStore((s) => s.settings)
  const closeSettings = useStore((s) => s.closeSettings)
  const updateSettings = useStore((s) => s.updateSettings)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      updateSettings({ backgroundImage: reader.result as string })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleClearBackground = () => {
    updateSettings({ backgroundImage: null })
  }

  const handlePresetColor = (color: string) => {
    updateSettings({ customBgColor: color, backgroundImage: null })
  }

  const handleExport = async () => {
    const json = await exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `starvault-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const success = await importData(text)
        setImportStatus(success ? 'success' : 'error')
        if (success) setTimeout(() => setImportStatus('idle'), 2000)
      } catch {
        setImportStatus('error')
      }
    }
    input.click()
  }, [importData])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeSettings}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
          >
            <div className="min-h-full glass-panel border-l border-neon-cyan/10 p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold neon-text-cyan">设置</h2>
                <button
                  onClick={closeSettings}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <section className="mb-8">
                <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-4">
                  背景设置
                </h3>

                <div className="flex gap-2 mb-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-neon-cyan/40 cursor-pointer transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    上传背景图片
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                    />
                  </label>
                  {settings.backgroundImage && (
                    <button
                      onClick={handleClearBackground}
                      className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm text-red-400 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      清除
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="text-xs text-gray-400 mb-2 block">
                    背景透明度: {Math.round(settings.backgroundOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.05"
                    value={settings.backgroundOpacity}
                    onChange={(e) =>
                      updateSettings({
                        backgroundOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #00f0ff ${(settings.backgroundOpacity - 0.3) * 143}%, rgba(255,255,255,0.1) ${(settings.backgroundOpacity - 0.3) * 143}%)`,
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    预设背景色
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((pc) => (
                      <button
                        key={pc.value}
                        onClick={() => handlePresetColor(pc.value)}
                        className={cn(
                          'w-9 h-9 rounded-lg border-2 transition-all hover:scale-110',
                          settings.customBgColor === pc.value
                            ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                            : 'border-white/10'
                        )}
                        style={{ backgroundColor: pc.value }}
                        title={pc.label}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-4">
                  字体设置
                </h3>
                <div className="space-y-2">
                  {FONT_PRESETS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => updateSettings({ fontFamily: font.cssFamily })}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all',
                        settings.fontFamily === font.cssFamily
                          ? 'neon-border bg-neon-cyan/5'
                          : 'border-white/5 hover:border-white/15 bg-white/[0.02]'
                      )}
                    >
                      <span
                        className="block text-sm font-medium mb-0.5"
                        style={{ fontFamily: font.cssFamily }}
                      >
                        {font.name}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {font.description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="mb-8">
                <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-4">
                  主题配色
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {THEME_PRESETS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ themeId: theme.id })}
                      className={cn(
                        'p-3 rounded-lg border transition-all text-left',
                        settings.themeId === theme.id
                          ? 'neon-border bg-neon-cyan/5'
                          : 'border-white/5 hover:border-white/15 bg-white/[0.02]'
                      )}
                    >
                      <div className="flex gap-1.5 mb-2">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.bgColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                      </div>
                      <span className="block text-xs font-medium">{theme.name}</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        {theme.description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-neon-cyan uppercase tracking-wider mb-4">
                  数据管理
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-colors text-sm text-neon-cyan"
                  >
                    <Download className="w-4 h-4" />
                    导出数据
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neon-magenta/10 border border-neon-magenta/20 hover:bg-neon-magenta/20 transition-colors text-sm text-neon-magenta"
                  >
                    <FileInput className="w-4 h-4" />
                    导入数据
                  </button>
                </div>
                {importStatus === 'success' && (
                  <p className="text-xs text-green-400 mt-2">数据导入成功</p>
                )}
                {importStatus === 'error' && (
                  <p className="text-xs text-red-400 mt-2">导入失败，请检查文件格式</p>
                )}
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}