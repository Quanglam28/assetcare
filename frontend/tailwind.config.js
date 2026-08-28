/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        sidebar: {
          bg: '#0f172a',
          hover: '#1e293b',
          active: '#1e40af',
          text: '#94a3b8',
          'text-active': '#ffffff',
          border: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'page-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'section-title': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'table-header': ['0.6875rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.05em' }],
        'data-primary': ['0.875rem', { lineHeight: '1.25rem' }],
        'data-secondary': ['0.75rem', { lineHeight: '1rem' }],
        'meta': ['0.6875rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        'DEFAULT': '0.375rem',
        'card': '0.5rem',
        'button': '0.375rem',
        'badge': '0.25rem',
      },
      boxShadow: {
        'panel': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'panel-hover': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'sidebar': '1px 0 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
}