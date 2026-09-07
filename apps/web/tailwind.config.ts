import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#1A1A1A",
        gold: "#C5A059",
        ivory: "#FAF9F6",
        "surface": "#f9f9f9",
        "surface-container-low": "#f4f3f3",
        "surface-container-highest": "#e2e2e2",
        "surface-bright": "#f9f9f9",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#444748",
        "outline": "#747878",
        "primary": "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1c1b1b",
        "status-positive-bg": "#E4EDE3",
        "status-positive-text": "#3F6B3A",
        "status-progress-bg": "#E2E9F1",
        "status-progress-text": "#3A5A85",
        "status-warning-bg": "#F5E9D8",
        "status-warning-text": "#8A5F1F",
        "status-inactive-bg": "#EAEAEA",
        "status-inactive-text": "#666666",
        "status-negative-bg": "#F3DEDA",
        "status-negative-text": "#9C3D2E",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      spacing: {
        sidebar: "280px",
        "stack-md": "24px",
        "stack-lg": "48px",
      },
      maxWidth: {
        content: "1600px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};

export default config;