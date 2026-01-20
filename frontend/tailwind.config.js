/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d1117", // GitHub Dark Dimmed
        surface: "#161b22",
        border: "#30363d",
        primary: "#58a6ff",    // Cyber Blue
        success: "#2ea043",    // Hacker Green
        warning: "#d29922",
        danger: "#f85149",
      },
      fontFamily: {
        mono: ['"Fira Code"', "monospace"], // The coding font
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}