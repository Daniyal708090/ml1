import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#0f172a",
        card: "#111827",
        accent: "#38bdf8"
      }
    }
  },
  plugins: []
};

export default config;
