/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary — deep indigo-blue ramp (premium, not violet)
        primary: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd3ff',
          300: '#8eb6ff',
          400: '#598dff',
          500: '#3366ff',
          600: '#1f48f5',
          700: '#1736e1',
          800: '#192eb6',
          900: '#1a2d8f',
          950: '#141d57',
        },
        // Accent — vibrant amber for CTAs / sale
        accent: {
          50: '#fff8eb',
          100: '#ffedc6',
          200: '#ffd888',
          300: '#ffc043',
          400: '#ffa820',
          500: '#f98307',
          600: '#dd5f02',
          700: '#b74106',
          800: '#94330d',
          900: '#7a2a0e',
          950: '#421405',
        },
        success: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
        warning: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f', 950: '#451a03',
        },
        error: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
        },
        // Neutral ink ramp tuned for dark/white premium
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b0b8c8',
          400: '#8590a8', 500: '#67718c', 600: '#525a72', 700: '#43495d',
          800: '#3a3f50', 900: '#1f2230', 950: '#121420',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(20, 25, 60, 0.12)',
        card: '0 10px 40px -12px rgba(20, 25, 60, 0.18)',
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(31, 72, 245, 0.45)',
        'inner-soft': 'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.25rem', '4xl': '1.75rem' },
      backgroundImage: {
        'grid-light': "linear-gradient(rgba(20,25,60,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,25,60,0.04) 1px, transparent 1px)",
        'grid-dark': "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
