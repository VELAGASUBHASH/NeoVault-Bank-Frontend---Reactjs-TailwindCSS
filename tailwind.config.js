/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        navy: {
          50: "#eef2ff",
          100: "#dce6ff",
          200: "#b9ccff",
          300: "#8aaaff",
          400: "#587fff",
          500: "#2d55ff",
          600: "#1433f5",
          700: "#0d22d8",
          800: "#111e6e",
          900: "#0a1245",
          950: "#060b2e",
        },
        vault: {
          red: "#e8192c",
          gold: "#f5c842",
          glass: "rgba(255,255,255,0.07)",
          border: "rgba(255,255,255,0.12)",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.18)",
        glow: "0 0 40px rgba(45,85,255,0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};