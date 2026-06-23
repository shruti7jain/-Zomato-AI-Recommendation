/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Exact surface tokens from DESIGN.md
        surface: {
          DEFAULT:   '#111415',
          dim:       '#111415',
          bright:    '#373a3b',
          low:       '#191c1d',
          container: '#1d2021',
          high:      '#282a2b',
          highest:   '#323536',
          variant:   '#323536',
        },
        // Accent: Saffron → Coral
        saffron: '#ff6b35',
        coral:   '#f7c948',
        // Design-system primaries
        primary:   '#c7c5d5',
        secondary: '#ffb59d',
        tertiary:  '#eec140',
        outline:   '#929096',
      },
      maxWidth: { container: '1200px' },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #ff6b35 0%, #f7c948 100%)',
        'hero-radial':     'radial-gradient(ellipse at 70% 50%, rgba(255,107,53,0.08) 0%, transparent 65%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 12px 2px rgba(255,107,53,0.35)' },
          '50%':     { boxShadow: '0 0 24px 6px rgba(255,107,53,0.6)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.45s ease-out forwards',
        shimmer:      'shimmer 1.8s infinite linear',
        float:        'float 3.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
