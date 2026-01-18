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
        // Dark Sport Theme
        'dark': {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          600: '#242424',
          500: '#2d2d2d',
          400: '#3d3d3d',
        },
        'anthracite': {
          900: '#1c1c1c',
          800: '#262626',
          700: '#333333',
          600: '#404040',
          500: '#4d4d4d',
        },
        'neon': {
          green: '#39ff14',
          'green-dark': '#32e010',
          'green-glow': 'rgba(57, 255, 20, 0.3)',
        },
        'league': {
          ligue1: '#091c3e',
          premier: '#3d195b',
          champions: '#1a0d33',
          laliga: '#ff4b44',
          seriea: '#024494',
          bundesliga: '#d20515',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(57, 255, 20, 0.3)',
        'neon-strong': '0 0 30px rgba(57, 255, 20, 0.5)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(57, 255, 20, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(57, 255, 20, 0.6)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(57, 255, 20, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(57, 255, 20, 0.8)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
    },
  },
  plugins: [],
}
