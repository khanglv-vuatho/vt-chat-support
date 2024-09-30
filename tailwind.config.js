const { nextui } = require('@nextui-org/theme')
const { colorsConfig } = require('./src/themes/color.ts')
const defaultTheme = require('tailwindcss/defaultTheme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ...defaultTheme.colors, // Giữ nguyên màu sắc mặc định của Tailwind
        ...colorsConfig // Thêm màu sắc của bạn
      }
    }
  },
  darkMode: 'class',
  plugins: [nextui()]
}
