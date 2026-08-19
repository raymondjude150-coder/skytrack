import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0E14",
        surface: "#121822",
        surface2: "#1A2230",
        line: "#232C3B",
        ink: "#F1F3F5",
        muted: "#8B93A1",
        accent: "#3B7CFF",
        accentDark: "#2A5FD9",
        success: "#34D399",
        warn: "#F5B942",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
