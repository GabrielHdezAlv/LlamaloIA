/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      letterSpacing: {
        'tighter': '-0.8px',
        'tightest': '-2px',
      },
    },
  },
  plugins: [],
};
