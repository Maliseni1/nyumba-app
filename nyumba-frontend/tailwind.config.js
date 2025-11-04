/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      // --- 1. ADD ALL YOUR CSS VARIABLES HERE ---
      colors: {
        'bg-color': 'var(--bg-color)',
        'card-color': 'var(--card-color)',
        'border-color': 'var(--border-color)',
        'text-color': 'var(--text-color)',
        'subtle-text-color': 'var(--subtle-text-color)',
        'accent-color': 'var(--accent-color)',
        'accent-hover-color': 'var(--accent-hover-color)',
      }
    },
  },
  plugins: [],
}