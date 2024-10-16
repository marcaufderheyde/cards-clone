import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        highlight: 'highlight 5s ease-in-out',
    },
    keyframes: {
        highlight: {
            '0%, 100%': { backgroundColor: '#ffff99' },
            '50%': { backgroundColor: '#ffffff' },
        },
    },
    },
  },
  plugins: [],
};
export default config;
