import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#3F2A33',
        velvet: '#FFF8FA',
        mist: '#8C6E78',
        pearl: '#432C36',
        cyan: '#E8A7B8',
        amber: '#D8B07A',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Avenir Next"', 'sans-serif'],
        body: ['"DM Sans"', '"SF Pro Display"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(232, 167, 184, 0.22), 0 24px 90px rgba(124, 70, 89, 0.14)',
        card: '0 20px 60px rgba(132, 82, 101, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 18% 12%, rgba(232, 167, 184, 0.22), transparent 34%), radial-gradient(circle at 82% 16%, rgba(216, 176, 122, 0.18), transparent 28%), radial-gradient(circle at 50% 108%, rgba(255, 214, 225, 0.42), transparent 30%), linear-gradient(180deg, #FFFDFE 0%, #FFF7FA 52%, #FFFFFF 100%)',
        glass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(255, 244, 247, 0.5))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
