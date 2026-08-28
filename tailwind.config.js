/** @type {import('tailwindcss').Config} */

// Reads a CSS custom property (defined per-theme in globals.css) as an
// alpha-capable color, so `bg-surface/50` etc. keep working under dark mode.
function themeColor(varName) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `rgb(var(${varName}))`
      : `rgb(var(${varName}) / ${opacityValue})`;
}

module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/tools-impl/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: themeColor("--color-paper"),
        surface: themeColor("--color-surface"),
        ink: themeColor("--color-ink"),
        muted: themeColor("--color-muted"),
        line: themeColor("--color-line"),
        brand: {
          DEFAULT: themeColor("--color-brand"),
          dark: themeColor("--color-brand-dark"),
          light: themeColor("--color-brand-light"),
        },
        teal: {
          DEFAULT: themeColor("--color-teal"),
          light: themeColor("--color-teal-light"),
        },
        amber: {
          DEFAULT: themeColor("--color-amber"),
          light: themeColor("--color-amber-light"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 19, 31, 0.04), 0 1px 12px rgba(16, 19, 31, 0.03)",
        hover: "0 8px 24px rgba(16, 19, 31, 0.08)",
      },
      maxWidth: {
        container: "1200px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
