/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Surfaces (pure black system) ──────────────────────────
        'dark': {
          900: '#000000',  // base background
          800: '#0a0a0a',
          700: '#111114',
          600: '#18181c',
          500: '#222228',
          400: '#2c2c34',
          300: '#3a3a44',
        },
        'anthracite': {
          900: '#0f0f12',
          800: '#161619',
          700: '#1e1e24',
          600: '#28282f',
          500: '#34343d',
        },

        // ── Brand — Gold / Amber ──────────────────────────────────
        'gold': {
          DEFAULT: '#F59E0B',
          light:   '#FBBF24',
          dark:    '#D97706',
          muted:   'rgba(245, 158, 11, 0.12)',
          glow:    'rgba(245, 158, 11, 0.25)',
        },
        'neon-green': '#F59E0B',  // legacy compat
        'neon': {
          green:       '#F59E0B',
          'green-dark': '#D97706',
          'green-glow': 'rgba(245, 158, 11, 0.25)',
        },

        // ── Apple System Colors ───────────────────────────────────
        'apple': {
          blue:          '#0A84FF',
          'blue-muted':  'rgba(10, 132, 255, 0.12)',
          green:         '#30D158',
          'green-muted': 'rgba(48, 209, 88, 0.12)',
          red:           '#FF453A',
          'red-muted':   'rgba(255, 69, 58, 0.12)',
          orange:        '#FF9F0A',
          yellow:        '#FFD60A',
          purple:        '#BF5AF2',
          teal:          '#5AC8FA',
        },

        // ── Leagues ───────────────────────────────────────────────
        'league': {
          ligue1:     '#0f2247',
          premier:    '#2f1242',
          champions:  '#1a1030',
          laliga:     '#3d0606',
          seriea:     '#002a5c',
          bundesliga: '#2d0000',
        },
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },

      borderRadius: {
        'ios':   '20px',   // iOS card radius
        'macos': '16px',   // macOS window radius
        'pill':  '100px',  // pill / badge
      },

      backdropBlur: {
        'apple': '40px',
        'glass': '60px',
      },

      boxShadow: {
        'neon':        '0 0 20px rgba(245, 158, 11, 0.20)',
        'neon-strong': '0 0 32px rgba(245, 158, 11, 0.38)',
        'gold':        '0 0 20px rgba(245, 158, 11, 0.20)',
        'gold-strong': '0 0 32px rgba(245, 158, 11, 0.38)',
        'blue':        '0 0 20px rgba(10, 132, 255, 0.22)',
        'card':        '0 2px 8px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.35)',
        'card-hover':  '0 4px 16px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.4)',
        'ios-widget':  '0 1px 0 rgba(255,255,255,0.04) inset, 0 2px 12px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)',
        'inset-top':   'inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      animation: {
        'pulse-neon':   'pulse-gold 2.5s ease-in-out infinite',
        'pulse-gold':   'pulse-gold 2.5s ease-in-out infinite',
        'glow':         'glow-gold 1.8s ease-in-out infinite alternate',
        'shimmer':      'shimmer 1.8s ease-in-out infinite',
        'float':        'float 4s ease-in-out infinite',
        'page-enter':   'page-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':     'scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },

      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245, 158, 11, 0.20)' },
          '50%':       { boxShadow: '0 0 22px rgba(245, 158, 11, 0.45)' },
        },
        'glow-gold': {
          '0%':   { textShadow: '0 0 8px rgba(245, 158, 11, 0.40)' },
          '100%': { textShadow: '0 0 18px rgba(245, 158, 11, 0.70)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },

      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'shimmer':           'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        'gold-shine':        'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(217,119,6,0.10) 100%)',
        'surface-01':        'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%)',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
