module.exports = {
  content: ['./index.html', './index.tsx', './App.tsx', './components/**/*.{ts,tsx}', './pages/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // 布局宽度
      width: {
        'sidebar': '280px',
        'main': '680px',
        'right': '360px',
      },
      maxWidth: {
        'main': '680px',
      },
      // 自定义颜色
      colors: {
        'telegram': '#0088cc',
        'twitter': '#1da1f2',
        // Chart colors for K-line
        'chart-up': '#10B981',      // emerald-500 - 吉运
        'chart-down': '#F43F5E',    // rose-500 - 凶运
        'ma5': '#818CF8',           // indigo-400
        'ma10': '#FBBF24',          // amber-400
        // Amber palette for Pro branding
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'grow-in': 'growIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(99, 102, 241, 0)' },
        },
        growIn: {
          '0%': { opacity: '0', transform: 'scaleY(0)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
      },
      // 字体
      fontFamily: {
        'serif-sc': ['"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
};
