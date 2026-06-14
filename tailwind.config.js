/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8f7',
          100: '#d5eeec',
          200: '#abddd8',
          300: '#7accc4',
          400: '#4ab8ae',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#0c3d3a',
        },
        secondary: {
          50: '#f4f7fa',
          100: '#e2e8f0',
          200: '#c5d0de',
          300: '#9aafc4',
          400: '#6f8da8',
          500: '#4a6a8a',
          600: '#364f6b',
          700: '#2a3f58',
          800: '#1e3350',
          900: '#152a42',
        },
      },
    },
  },
  plugins: [],
};
