import React from 'react';
import { Sparkles } from 'lucide-react';

interface SimilarityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * SimilarityBadge - 相似度徽章组件
 * 显示用户与名人的八字相似度百分比
 */
export const SimilarityBadge: React.FC<SimilarityBadgeProps> = ({
  score,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  // Determine color based on score
  const getColorClasses = () => {
    if (score >= 80) {
      return {
        bg: 'bg-gradient-to-r from-amber-400 to-orange-500',
        text: 'text-white',
        ring: 'ring-amber-300',
        glow: 'shadow-amber-200',
      };
    } else if (score >= 60) {
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        text: 'text-white',
        ring: 'ring-blue-300',
        glow: 'shadow-blue-200',
      };
    } else if (score >= 40) {
      return {
        bg: 'bg-gradient-to-r from-slate-400 to-slate-500',
        text: 'text-white',
        ring: 'ring-slate-300',
        glow: 'shadow-slate-200',
      };
    } else {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        ring: 'ring-gray-200',
        glow: '',
      };
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-10 h-10',
          text: 'text-xs font-bold',
          icon: 'w-2.5 h-2.5',
          label: 'text-[10px]',
        };
      case 'lg':
        return {
          container: 'w-20 h-20',
          text: 'text-xl font-bold',
          icon: 'w-5 h-5',
          label: 'text-sm',
        };
      case 'md':
      default:
        return {
          container: 'w-14 h-14',
          text: 'text-sm font-bold',
          icon: 'w-3.5 h-3.5',
          label: 'text-xs',
        };
    }
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();
  const roundedScore = Math.round(score);
  const isHighScore = score >= 80;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`
          ${sizes.container}
          ${colors.bg}
          ${colors.text}
          rounded-full
          flex items-center justify-center
          ring-2 ${colors.ring}
          shadow-lg ${colors.glow}
          relative
          transition-all duration-300
          hover:scale-105
        `}
      >
        {isHighScore && (
          <Sparkles
            className={`absolute -top-1 -right-1 ${sizes.icon} text-amber-300 animate-pulse`}
          />
        )}
        <span className={sizes.text}>{roundedScore}%</span>
      </div>

      {showLabel && (
        <span className={`${sizes.label} ${colors.text === 'text-white' ? 'text-gray-600' : colors.text} font-medium`}>
          {score >= 80 ? '高度相似' : score >= 60 ? '中等相似' : score >= 40 ? '有相似点' : '差异较大'}
        </span>
      )}
    </div>
  );
};

/**
 * Inline version for use in lists/cards
 */
export const SimilarityBadgeInline: React.FC<{
  score: number;
  className?: string;
}> = ({ score, className = '' }) => {
  const roundedScore = Math.round(score);

  const getColorClasses = () => {
    if (score >= 80) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        text-xs font-bold
        rounded-full
        border
        ${getColorClasses()}
        ${className}
      `}
    >
      {score >= 80 && <Sparkles className="w-3 h-3" />}
      {roundedScore}%
    </span>
  );
};

export default SimilarityBadge;
