/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#0f1525',
          card: '#131a2e',
          elevated: '#1a2238',
        },
        border: {
          DEFAULT: '#1e2940',
          light: '#2a3650',
        },
        text: {
          primary: '#e8edf5',
          secondary: '#8b95a8',
          muted: '#5a6478',
        },
        accent: {
          DEFAULT: '#3b82f6',
          glow: '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
