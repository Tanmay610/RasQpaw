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
          50: '#f4f6f8',
          100: '#e4e9f0',
          500: '#3f51b5',
          600: '#303f9f',
          900: '#1a237e',
        },
        priority: {
          critical: '#ef4444', // Red
          high: '#f97316', // Orange
          medium: '#eab308', // Yellow
          low: '#22c55e', // Green
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
