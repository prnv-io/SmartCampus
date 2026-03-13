module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          100: '#F6DAD0',
          300: '#F2B7A0',
          DEFAULT: '#E07A5F',
          700: '#C65C45'
        }
      }
    }
  },
  plugins: []
}
