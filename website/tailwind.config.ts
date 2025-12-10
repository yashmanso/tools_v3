import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#ffffff',
          text: '#222222',
          secondary: '#666666',
          border: '#e0e0e0',
        },
        dark: {
          bg: '#1e1e1e',
          text: '#dadada',
          secondary: '#a0a0a0',
          border: '#404040',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
