/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nature Modernist Palette
        nature: {
          soft: '#A3B18A',   // Sage
          cream: '#F4F1DE',  // Sand/Cream
          clay: '#E07A5F',   // Muted Terracotta (Accent)
          slate: '#3D405B',  // Deep Slate (Text)
          wood: '#81B29A',   // Muted Green-Blue
          leaf: '#588157',   // Deeper Sage
          bg: '#FAF9F6',     // Off-white/Bone background
        },
        // Semantic overrides
        primary: {
          50: '#f7f8f4',
          100: '#edf0e9',
          200: '#dce1d3',
          300: '#c0cbb2',
          400: '#a3b18a', // main sage
          500: '#899a6e',
          600: '#6a7855',
          700: '#4f5a40',
          800: '#343c2b',
          900: '#1d2118',
        },
        neutral: {
          50: '#FAF9F6',
          100: '#F2F1ED',
          200: '#E5E4DE',
          300: '#D1CFCA',
          400: '#A19E98',
          500: '#73716C',
          600: '#52504C',
          700: '#3D405B', // Using slate for darks
          800: '#2A2C3E',
          900: '#191A25',
        },
        accent: {
          main: '#E07A5F',   // Clay
          soft: '#F2CC8F',   // Muted Yellow
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(163, 177, 138, 0.15)',
        'soft-lg': '0 10px 30px -5px rgba(163, 177, 138, 0.2)',
      }
    },
  },
  plugins: [],
}
