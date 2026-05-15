import { useRef, useEffect, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  colorStr: string
}

interface ParticleBackgroundProps {
  themeId?: string
  backgroundImage?: string
  backgroundOpacity?: number
  customBgColor?: string
}

const PARTICLE_DENSITY = 10000
const CONNECT_DISTANCE = 140
const MAX_DPR = 2
const RESIZE_DEBOUNCE = 200

const CONNECTION_COLORS: string[] = []
for (let i = 0; i <= 100; i++) {
  const alpha = (i / 100 * 0.15).toFixed(3)
  CONNECTION_COLORS.push(`rgba(0,240,255,${alpha})`)
}

function getColorIndex(opacity: number): number {
  return Math.min(Math.floor(opacity * 100), 100)
}

export default function ParticleBackground({
  themeId,
  backgroundImage,
  backgroundOpacity = 1,
  customBgColor,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.floor((width * height) / PARTICLE_DENSITY)
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const opacity = Math.random() * 0.5 + 0.2
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 1.8 + 0.4,
        opacity,
        colorStr: `rgba(0,240,255,${opacity.toFixed(2)})`,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      initParticles(width, height)
    }

    resize()

    function handleResize() {
      clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = setTimeout(resize, RESIZE_DEBOUNCE)
    }

    window.addEventListener('resize', handleResize)

    const CELL_SIZE = CONNECT_DISTANCE

    function buildGrid(particles: Particle[]) {
      const cols = Math.ceil(width / CELL_SIZE)
      const rows = Math.ceil(height / CELL_SIZE)
      const grid: number[][] = Array.from({ length: cols * rows }, () => [])

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const col = Math.floor(p.x / CELL_SIZE)
        const row = Math.floor(p.y / CELL_SIZE)
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          grid[row * cols + col].push(i)
        }
      }

      return { grid, cols, rows }
    }

    function animate() {
      if (document.hidden) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      const particles = particlesRef.current
      ctx!.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
      }

      const { grid, cols, rows } = buildGrid(particles)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cellIdx = row * cols + col
          const cell = grid[cellIdx]
          if (cell.length === 0) continue

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr
              const nc = col + dc
              if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
              const neighborIdx = nr * cols + nc
              const neighborCell = grid[neighborIdx]

              for (let i = 0; i < cell.length; i++) {
                const pi = particles[cell[i]]
                const startJ = (dr === 0 && dc === 0) ? i + 1 : 0

                for (let j = startJ; j < neighborCell.length; j++) {
                  const pj = particles[neighborCell[j]]
                  const dx = pi.x - pj.x
                  const dy = pi.y - pj.y
                  const dist = dx * dx + dy * dy

                  if (dist < CONNECT_DISTANCE * CONNECT_DISTANCE) {
                    const normDist = 1 - Math.sqrt(dist) / CONNECT_DISTANCE
                    const avgOpacity = (pi.opacity + pj.opacity) / 2
                    const colorIdx = getColorIndex(normDist * avgOpacity)
                    ctx!.strokeStyle = CONNECTION_COLORS[colorIdx]
                    ctx!.lineWidth = 0.5
                    ctx!.beginPath()
                    ctx!.moveTo(pi.x, pi.y)
                    ctx!.lineTo(pj.x, pj.y)
                    ctx!.stroke()
                  }
                }
              }
            }
          }
        }
      }

      for (const p of particles) {
        ctx!.fillStyle = p.colorStr
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fill()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimerRef.current)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [initParticles])

  const themeColors: Record<string, string> = {
    night: '#0a0a1a',
    aurora: '#0d1b2a',
    cherry: '#1a0a1a',
    forest: '#0a1a0d',
    ocean: '#0a0d1a',
  }

  const bgColor = customBgColor || (themeId ? themeColors[themeId] : '#0a0a1a')

  return (
    <div className="fixed inset-0 -z-10">
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: backgroundOpacity,
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: bgColor }}
      />
    </div>
  )
}