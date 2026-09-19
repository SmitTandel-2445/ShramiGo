/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5A00',
          'orange-dark': '#E64A00',
          'orange-light': '#FFF1E8',
          teal: '#087F7A',
          'teal-dark': '#05635F',
          'teal-light': '#E6F7F5',
        },
        dark: {
          canvas: '#090E17',
          surface: '#111928',
          elevated: '#172235',
          border: '#24324A',
          primary: '#00E5FF',
          accent: '#FF6A1A',
        },
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        input: '12px',
      },
    },
  },
  plugins: [],
}
