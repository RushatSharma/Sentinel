/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'], // For Headlines
        mono: ['"JetBrains Mono"', 'monospace'],    // For Tags/Labels
      },
      colors: {
        // The JSON "Global Theme" Palette
        background: "#050505",
        card: {
          DEFAULT: "#0f0f0f",
          border: "#1f1f1f"
        },
        primary: {
          DEFAULT: "#39ff14", // Neon Green
          glow: "rgba(57, 255, 20, 0.15)",
        },
        text: {
          primary: "#ffffff",
          secondary: "#9ca3af"
        }
      },
      backgroundImage: {
        'green-gradient': 'radial-gradient(circle at 50% 50%, rgba(57, 255, 20, 0.15) 0%, transparent 70%)',
        'grid-pattern': "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.1)" },
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}