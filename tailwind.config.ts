import type { Config } from "tailwindcss";

export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom accent colors - explicitly defined for Safari iOS compatibility
        "accent-cyan": "oklch(0.65 0.28 200)",
        "accent-gold": "oklch(0.72 0.22 80)",
        "accent-emerald": "oklch(0.68 0.26 142)",
      },
    },
  },
  plugins: [],
} satisfies Config;
