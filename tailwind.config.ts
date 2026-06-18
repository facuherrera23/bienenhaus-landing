import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: {
          1: '#080808',
          2: '#0d0d0d',
          3: '#141414',
          4: '#1c1c1c',
        },
        accent: {
          DEFAULT: '#20b8ab',
          dark: '#178c81',
          glow: 'rgba(32,184,171,0.15)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#9a9a9a',
          muted: '#555555',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          medium: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.22)',
        },
        error: '#cc3535',
        success: '#3aaa55',
        warning: '#cc9922',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        num: ['Montserrat', 'sans-serif'],
        elegant: ['Quicksand', 'sans-serif'],
        desc: ['Open Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { letterSpacing: '0.12em' }],
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['20px', { lineHeight: '1.3' }],
        'xl': ['24px', { lineHeight: '1.2' }],
        '2xl': ['34px', { lineHeight: '1.1' }],
        '3xl': ['48px', { lineHeight: '1' }],
        '4xl': ['66px', { lineHeight: '0.95' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,.3)',
        md: '0 4px 12px rgba(0,0,0,.4)',
        lg: '0 8px 32px rgba(0,0,0,.5)',
        accent: '0 0 20px rgba(32,184,171,0.15)',
        'accent-sm': '0 0 12px rgba(32,184,171,0.1)',
      },
      maxWidth: {
        container: '1280px',
      },
      letterSpacing: {
        tight: '-0.02em',
        narrow: '0.02em',
        wide: '0.06em',
        label: '0.1em',
        badge: '0.12em',
        section: '0.14em',
        modal: '0.16em',
        eyebrow: '0.18em',
        brand: '0.2em',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(32,184,171,0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(32,184,171,0.25)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease forwards',
        fadeIn: 'fadeIn 0.5s ease forwards',
        scaleIn: 'scaleIn 0.5s ease forwards',
        shimmer: 'shimmer 1.8s infinite linear',
        glowPulse: 'glowPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
