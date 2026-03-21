/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#BFFF00',
          dark: '#9ED600',
        },
        black: '#1A1A1A',
        dark: '#2D2D2D',
        white: '#FFFFFF',
        'off-white': '#F2F2F0',
        coral: {
          DEFAULT: '#FF5C5C',
          dark: '#E04545',
        },
        info: '#4DA8FF',
        premium: '#8B5CF6',
        warning: '#FF9F43',
        success: '#2DD4A8',
        divider: {
          light: '#E5E5E3',
          dark: '#3A3A3A',
        },
      },
      fontFamily: {
        sans: ['Nunito_400Regular'],
        medium: ['Nunito_500Medium'],
        semibold: ['Nunito_600SemiBold'],
        bold: ['Nunito_700Bold'],
        extrabold: ['Nunito_800ExtraBold'],
        heading: ['Nunito_900Black'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        modal: '0 8px 32px rgba(0,0,0,0.12)',
        float: '0 4px 16px rgba(0,0,0,0.16)',
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
    },
  },
  plugins: [],
};
