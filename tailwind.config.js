/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloomberg-black': '#000000',
        'bloomberg-white': '#FFFFFF',
        'bloomberg-amber': '#FF9800',
        'bloomberg-amber-dark': '#E65100',
      },
      fontFamily: {
        'mono': ['Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      borderRadius: {
        'none': '0',
      },
      spacing: {
        'dense': '0.25rem',
        'dense-md': '0.5rem',
      },
    },
  },
  plugins: [],
  corePlugins: {
    borderRadius: false,
  },
}

