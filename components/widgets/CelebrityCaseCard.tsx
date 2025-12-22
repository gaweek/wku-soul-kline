import React from 'react';
import { Star, TrendingUp } from 'lucide-react';

interface Celebrity {
  id: string;
  name: string;
  nameCn: string;
  category: string;
  categoryCn: string;
  description: string;
}

interface CelebrityCaseCardProps {
  celebrity: Celebrity;
  similarity?: number;
  compact?: boolean;
  onClick: () => void;
}

export const CelebrityCaseCard: React.FC<CelebrityCaseCardProps> = ({
  celebrity,
  similarity,
  compact = false,
  onClick,
}) => {
  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'tech': 'bg-blue-100 text-blue-700 border-blue-200',
      'business': 'bg-green-100 text-green-700 border-green-200',
      'entertainment': 'bg-purple-100 text-purple-700 border-purple-200',
      'sports': 'bg-orange-100 text-orange-700 border-orange-200',
      'politics': 'bg-red-100 text-red-700 border-red-200',
      'science': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'art': 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-amber-300 transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-amber-700 transition-colors truncate text-left">
              {celebrity.nameCn}
            </h4>
            <p className="text-xs text-gray-500 truncate text-left">
              {celebrity.name}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(celebrity.category)}`}>
              {celebrity.categoryCn}
            </span>
            {similarity !== undefined && (
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <TrendingUp className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">
                  {similarity}%
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-amber-300 transition-all group"
    >
      <div className="space-y-3">
        {/* Header with names */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-700 transition-colors truncate text-left">
              {celebrity.nameCn}
            </h3>
            <p className="text-sm text-gray-500 truncate text-left mt-0.5">
              {celebrity.name}
            </p>
          </div>

          {similarity !== undefined && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm flex-shrink-0">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-amber-700">
                {similarity}% 匹配
              </span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${getCategoryColor(celebrity.category)}`}>
            {celebrity.categoryCn}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 text-left">
          {celebrity.description}
        </p>

        {/* View More Indicator */}
        <div className="flex items-center justify-end">
          <span className="text-xs font-medium text-amber-600 group-hover:text-amber-700">
            查看详情 →
          </span>
        </div>
      </div>
    </button>
  );
};

export default CelebrityCaseCard;
