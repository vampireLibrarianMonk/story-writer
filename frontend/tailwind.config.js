/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#1A1A2E',
        editor: '#0D0D14',
        'accent-cyan': '#06B6D4',
        'accent-magenta': '#D946EF',
        'accent-amber': '#F59E0B',
      },
    },
  },
  plugins: [],
}
