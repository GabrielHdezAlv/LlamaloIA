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
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
