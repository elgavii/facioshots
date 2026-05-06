/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#F5F0E8',
        'warm-white': '#FAF8F4',
        charcoal: '#1A1814',
        muted: '#8A8278',
        gold: '#C9A84C',
        'gold-light': '#E8D5A3',
      },
    },
  },
  plugins: [],
}
