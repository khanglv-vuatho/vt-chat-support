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
      boxShadow: {
        'custom-ball': 'inset 0 -20px 30px #fff, inset 40px 0 46px #eaf5fc, inset 58px 0 60px #c2d8fe, inset -8px -30px 100px #fde9ea, inset 0 20px 110px #fde9ea, 0 0 90px #fff'
      },
      colors: {
        ...defaultTheme.colors, // Giữ nguyên màu sắc mặc định của Tailwind
        ...colorsConfig // Thêm màu sắc của bạn
      }
    }
  },
  darkMode: 'class',
  plugins: [nextui()]
}
