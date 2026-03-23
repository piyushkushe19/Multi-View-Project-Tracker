/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: {
          1: '#0d0d0f',
          2: '#13131a',
          3: '#1a1a24',
          4: '#22222e',
        },
        accent: {
          DEFAULT: '#6f5de7',
          light: '#8b7ef5',
          muted: 'rgba(111,93,231,0.15)',
        },
        border: {
          dim: 'rgba(255,255,255,0.08)',
          DEFAULT: 'rgba(255,255,255,0.14)',
        },
      },
    },
  },
  plugins: [],
}
