/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        plum: 'var(--bg-plum)',
        midnight: 'var(--bg-midnight)',
        rose: 'var(--accent-rose)',
        peach: 'var(--accent-peach)',
        lavender: 'var(--accent-lavender)',
        gold: 'var(--accent-gold)',
        cream: 'var(--text-cream)',
      },
      fontFamily: {
        display: ['"Fraunces"', '"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Poppins"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
