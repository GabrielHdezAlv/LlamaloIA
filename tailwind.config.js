/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class", // Usaremos la clase `dark` en el <html> para el modo oscuro
  theme: {
    extend: {
      fontFamily: {
        sans: ["InterVariable", ...defaultTheme.fontFamily.sans],
        "dm-sans": ["DM Sans", ...defaultTheme.fontFamily.sans],
      },
      screens: {
        '3xl': '1900px',
        '4xl': '2500px',
      },
      /** Modal plan celebration: un solo lugar para el ancho/alto (uso en HTML y @apply global). */
      width: {
        "plan-celebration": "min(29.5rem, calc(100vw - 2rem))",
      },
      maxWidth: {
        "plan-celebration": "min(29.5rem, calc(100vw - 2rem))",
      },
      maxHeight: {
        "plan-celebration": "min(90vh, 45rem)",
      },
    },
  },
  plugins: [],
};
