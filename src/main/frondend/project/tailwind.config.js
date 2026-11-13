/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1612',
        'ink-soft': '#3a342c',
        parchment: '#f5efe4',
        gold: '#c9a227',
        'gold-soft': '#e6d29a',
        'gold-deep': '#6b5a12',
        terra: '#b5532a',
        'terra-deep': '#7a3618',
        sage: '#6b7a5a',
        'sage-deep': '#4b5940',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
};
