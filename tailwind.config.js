/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        paper: "#f6f1e8",
        moss: "#596b45",
        tide: "#087f8c",
        ember: "#b45432",
        saffron: "#d39d38"
      },
      boxShadow: {
        quiet: "0 16px 48px rgba(20, 33, 61, 0.12)"
      }
    }
  },
  plugins: []
};
