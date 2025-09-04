/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    '@tailwindcss/postcss': {},   // Tailwind v4 PostCSS plugin
    autoprefixer: {},             // optional but fine to keep
  },
};