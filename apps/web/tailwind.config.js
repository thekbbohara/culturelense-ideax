/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B32624', // Crimson Red (Simrik)
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#DAA520', // Golden/Mustard (Goura)
          foreground: '#1A1A1A',
        },
        tertiary: {
          DEFAULT: '#E2725B', // Terracotta (Mato)
          foreground: '#FFFFFF',
        },
        neutral: {
          white: '#FDFBF7', // Off-White (Dugdh)
          black: '#1A1A1A', // Deep Black (Kaalo)
          gray: '#808080',
        },
        accent: {
          blue: '#003366', // Deep Blue (Nil)
        },
        semantic: {
          success: '#2E7D32',
          warning: '#FF6F00',
          error: '#C62828',
          info: '#0277BD',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
