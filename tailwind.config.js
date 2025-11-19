/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary, #67C090)",
        "primary-dark": "var(--color-primary-dark, #56b381)",
        secondary: "var(--color-secondary, #26667F)",
        "light-info": "var(--color-light-info, #DDF4E7)",
        accent: "var(--color-accent, #21272A)",
        neutral: "var(--color-accent, #222222)",
        "custom-gray": " var(--color-custom-gray, #545F71)",
        "neutral-gray": " var(--color-neutral-gray, #9ca3af)",
        "input-bg": "var(--color-input-bg, #F2F4F8)",
      },
      // colors: {
      //   "light-info":  "#CCCFD5",
      //   secondary: "#545F71",
      //   primary: "#0A182D",
      //   neutral: "#767676",
      //   "neutral-default": "#303030",
      //   accent: "#21272A",
      //   "input-bg": "#F2F4F8",
      // },
    },
  },
  plugins: [require("tw-elements/dist/plugin"), require("@tailwindcss/forms")],
};
