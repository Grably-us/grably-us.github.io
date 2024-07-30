module.exports = {
  purge: ['./src/**/*.{svelte,js,ts}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      animation: {
        fade: 'fade 3s linear infinite',
      },
      keyframes: {
        fade: {
          '0%': { transform: 'scale(1) translateX(0%)', opacity: 1 },
          '100%': { transform: 'scale(0.8) translateX(-30%)', opacity: 0 },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
