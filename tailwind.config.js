/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        main: '#2B2D31',
        primary: '#313338',
        secondary: '#443C68',
      },
      fontSize: {
        xxs: '.6rem',
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};
