/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        slate: {
          850: '#0f172a',
          925: '#080f1e',
          950: '#020617',
        },
        // Accent palette for psychological impact
        amber: {
          350: '#fcd34d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-sm':    '0 0 12px rgba(99,102,241,0.15)',
        'glow':       '0 0 24px rgba(99,102,241,0.20)',
        'glow-lg':    '0 0 48px rgba(99,102,241,0.25)',
        'glow-amber': '0 0 24px rgba(245,158,11,0.20)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'card':       '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25)',
        'brand-sm':   '0 4px 14px rgba(99,102,241,0.25)',
        'brand-md':   '0 6px 20px rgba(99,102,241,0.30)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow':       'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
        'card-shine':      'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':    'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in':        'fade-in 0.3s ease both',
        'fade-in-up':     'fade-in-up 0.5s ease both',
        'shimmer':        'shimmer 3s linear infinite',
        'gradient-x':     'gradient-x 4s ease infinite',
        'pulse-glow':     'pulse-glow 2.5s ease-in-out infinite',
        'count-up':       'count-up 0.4s ease both',
        'spin-slow':      'spin 4s linear infinite',
      },
    },
  },
  plugins: [],
}
