import { useRef, useEffect, useCallback } from 'react'
import { THEME_PRESETS } from '@/types'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

interface ParticleBackgroundProps {
  themeId?: string
  backgroundImage?: string | null
  backgroundOpacity?: number
}

const PARTICLE_COLORS = ['#00f0ff', '#ff2d95', '#00f0ff88', '#ff2d9588']
const CONNECT_DISTANCE = 120
const PARTICLE_DENSITY = 8000

export default function ParticleBackground({
  themeId = 'starnight',
  backgroundImage,
  backgroundOpacity = 0.3,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const dimensionsRef = useRef({ width: 0, height: 0 })

  const theme = THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0]

  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.max(30, Math.floor((width * height) / PARTICLE_DENSITY))
    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      })
    }

    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const updateDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dimensionsRef.current = { width: rect.width, height: rect.height }
      initParticles(rect.width, rect.height)
    }

    updateDimensions()

    const animate = () => {
      const { width, height } = dimensionsRef.current
      const particles = particlesRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECT_DISTANCE) {
            const opacity = 1 - dist / CONNECT_DISTANCE
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 240, 255, ${(opacity * 0.15).toFixed(3)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      updateDimensions()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [initParticles])

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: theme.bgColor }}
      />
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: backgroundOpacity,
          }}
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}