/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        void: {
          DEFAULT: '#0f0f1a',
          light: '#1a1a2e',
          lighter: '#252540',
        },
        neon: {
          cyan: '#00f0ff',
          magenta: '#ff2d95',
          amber: '#ffb347',
          violet: '#7c3aed',
          green: '#00ff88',
          orange: '#ff8c00',
          pink: '#ff6b9d',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        pixel: ['Press Start 2P', 'monospace'],
        handwriting: ['ZCOOL XiaoWei', 'serif'],
        rounded: ['M PLUS Rounded 1c', 'sans-serif'],
        cyber: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'card-hover': 'cardHover 0.3s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseNeon: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(255, 45, 149, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 15px rgba(255, 45, 149, 1))' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-6px) scale(1.02)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
    },
  },
  plugins: [],
};