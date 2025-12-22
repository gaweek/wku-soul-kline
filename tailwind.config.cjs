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

        // 紫色主题系统
        'mystic': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },

        // 金色系统
        'golden': {
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

        // 奶油色系统（侧边栏）
        'cream': {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf4e8',
          300: '#fbe9d0',
          400: '#f8ddb8',
          500: '#f5d0a0',
        },

        // 星空深色系统
        'cosmos': {
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },

        // Amber palette for Pro branding (保留向后兼容)
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
      // 渐变背景
      backgroundImage: {
        'gradient-mystic': 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)',
        'gradient-golden': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'gradient-cosmos': 'linear-gradient(180deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)',
        'gradient-btn-action': 'linear-gradient(135deg, #9333ea 0%, #fbbf24 100%)',
      },
      // 阴影光晕
      boxShadow: {
        'glow-golden': '0 0 20px rgba(251, 191, 36, 0.4)',
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      // 自定义动画
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'grow-in': 'growIn 0.5s ease-out forwards',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
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
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
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
