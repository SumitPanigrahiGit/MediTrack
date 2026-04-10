/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Important for manual theme toggling
  theme: {
    extend: {
      colors: {
        // Custom colors for light/dark mode
        light: {
          bg: '#ffffff',
          text: '#1a1a1a',
          card: '#f3f4f6',
        },
        dark: {
          bg: '#1a1a1a',
          text: '#ffffff',
          card: '#2d2d2d',
        }
      }
    },
  },
  plugins: [],
}