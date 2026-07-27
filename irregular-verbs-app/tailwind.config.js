/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b8d0ff",
          300: "#8ab0ff",
          400: "#5b8bff",
          500: "#3466f6",
          600: "#254bd1",
          700: "#1e3aa8",
          800: "#1c3186",
          900: "#1b2c6c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
