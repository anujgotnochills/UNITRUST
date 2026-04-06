import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F5',
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F5F2F0',
        },
        border: {
          DEFAULT: '#E5E5E5',
          light: '#F0F0F0',
        },
        accent: {
          green: '#00FF88',
          purple: '#7C3AED',
          blue: '#00B8FF',
          pink: '#FF8DA1', // specific Chromia banner color
        },
        muted: {
          DEFAULT: '#666666',
          dark: '#333333',
        },
        foreground: '#1A1A1A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'hero': 'clamp(64px, 10vw, 140px)',
        'section': 'clamp(40px, 6vw, 80px)',
        'card-title': 'clamp(24px, 3vw, 32px)',
      },
      letterSpacing: {
        'display': '-0.04em',
        'nav': '0.02em',
      },
      maxWidth: {
        'content': '1280px',
      },
      animation: {
        'blob': 'blob 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #00FF88 0%, #00B8FF 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
