/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Evolventa', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
