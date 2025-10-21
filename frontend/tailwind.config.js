/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#dbeeff",
          200: "#b7ddff",
          300: "#7fbfff",
          400: "#4d9bff",
          500: "#2563eb", // main primary
          600: "#1f4ed8",
          700: "#1a3fb5",
          800: "#15348d",
        },
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          500: "#7c3aed",
        },
        danger: {
          50: "#fff1f2",
          100: "#ffe4e6",
          300: "#fca5a5",
          500: "#ef4444",
          700: "#b91c1c",
        },
        success: {
          50: "#f0fdf4",
          500: "#16a34a",
        },
        neutral: {
          50: "#fbfbfd",
          100: "#f5f7fa",
          300: "#e6e9ee",
          500: "#9aa4b2",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(2,6,23,0.06)",
        insetSoft: "inset 0 1px 0 rgba(255,255,255,0.5)",
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
};
