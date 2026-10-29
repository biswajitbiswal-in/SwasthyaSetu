/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Tokens from User Specification
        charcoal: {
          950: '#111315',
          900: '#17191C', // Sidebar dark charcoal
          850: '#1E2125',
          800: '#26292E',
          700: '#34383F',
        },
        canvas: '#F5F5F2', // Main background
        surface: '#FFFFFF', // White cards
        primaryText: '#202124', // Primary text
        secondaryText: '#73777F', // Secondary text
        subtleBorder: '#E6E7E9', // Clean borders
        amberOrange: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B', // Primary Orange
          600: '#E88924', // Burnt Orange
          700: '#C96E14',
          800: '#9E4E0D',
        },
        forestGreen: {
          50: '#F0F9F5',
          100: '#E1F2EC',
          500: '#287D65', // Success
          600: '#1F6853',
          700: '#185443',
        },
        crimsonRed: {
          50: '#FDF2F2',
          100: '#FCE4E4',
          500: '#C44747', // Error
          600: '#A93636',
          700: '#8C2929',
        },
        warningAmber: {
          50: '#FFFDF0',
          100: '#FEF9C3',
          500: '#B7791F', // Warning
          600: '#975A16',
          700: '#744210',
        },
        infoBlue: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          500: '#4776A8', // Information
          600: '#355F8D',
          700: '#264870',
        },
        // Backwards compatibility mappings
        slate: {
          50: '#F5F5F2',
          100: '#ECECE8',
          200: '#E6E7E9',
          300: '#D5D7DA',
          400: '#9AA0A6',
          500: '#73777F',
          600: '#52555A',
          700: '#3C3F45',
          800: '#26292E',
          900: '#202124',
          950: '#17191C',
        },
        teal: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#E88924',
          700: '#E88924',
          800: '#C96E14',
          900: '#9E4E0D',
        },
        emerald: {
          50: '#F0F9F5',
          100: '#E1F2EC',
          500: '#287D65',
          600: '#1F6853',
          700: '#185443',
        },
        brand: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#E88924',
          700: '#E88924',
          800: '#C96E14',
          900: '#17191C',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(23, 25, 28, 0.04), 0 1px 2px -1px rgba(23, 25, 28, 0.04)',
        'card-hover': '0 6px 12px -2px rgba(23, 25, 28, 0.06), 0 3px 6px -3px rgba(23, 25, 28, 0.04)',
        'popup': '0 10px 25px -5px rgba(23, 25, 28, 0.1), 0 8px 10px -6px rgba(23, 25, 28, 0.08)',
      },
      borderRadius: {
        'card': '16px',
        'subtle': '12px',
      }
    },
  },
  plugins: [],
}
