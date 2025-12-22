import React from 'react';
import { TrendingUp, Flame, ArrowRight } from 'lucide-react';

interface TrendingCase {
  id: string;
  name: string;
  count: number;
}

interface TrendingCategory {
  id: string;
  name: string;
  count: number;
}

interface CelebrityCase {
  id: string;
  name: string;
  nameCn: string;
  category: string;
  categoryCn: string;
  similarity?: number;
}

interface TrendingCardProps {
  trendingCases: TrendingCase[];
  trendingCategories: TrendingCategory[];
  celebrityCases?: CelebrityCase[];
  onCaseClick: (caseId: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onCelebrityClick?: (celebrityId: string) => void;
  onViewAllCelebrities?: () => void;
  totalCelebrities?: number;
}

export const TrendingCard: React.FC<TrendingCardProps> = ({
  trendingCases,
  trendingCategories,
  celebrityCases = [],
  onCaseClick,
  onCategoryClick,
  onCelebrityClick,
  onViewAllCelebrities,
  totalCelebrities = 25,
}) => {
  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'tech': 'bg-blue-100 text-blue-700',
      'business': 'bg-green-100 text-green-700',
      'entertainment': 'bg-purple-100 text-purple-700',
      'sports': 'bg-orange-100 text-orange-700',
      'politics': 'bg-red-100 text-red-700',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-bold text-gray-800">热门推荐</h3>
      </div>

      {/* Celebrity Cases Section */}
      {celebrityCases.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">🔥 热门名人案例</div>
          <div className="space-y-2">
            {celebrityCases.map((celebrity) => (
              <button
                key={celebrity.id}
                onClick={() => onCelebrityClick?.(celebrity.id)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-lg p-2.5 transition-all group border border-amber-100"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-amber-700 truncate w-full text-left">
                      {celebrity.nameCn}
                    </span>
                    <span className="text-xs text-gray-500 truncate w-full text-left">
                      {celebrity.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${getCategoryColor(celebrity.category)}`}>
                    {celebrity.categoryCn}
                  </span>
                  {celebrity.similarity && (
                    <span className="text-xs font-bold text-amber-600">
                      {celebrity.similarity}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* View All Link */}
          {onViewAllCelebrities && (
            <button
              onClick={onViewAllCelebrities}
              className="w-full mt-3 flex items-center justify-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 py-2 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <span>查看全部 {totalCelebrities} 个案例</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Trending Cases */}
      {trendingCases.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">热门案例类型</div>
          <div className="space-y-2">
            {trendingCases.map((item) => (
              <button
                key={item.id}
                onClick={() => onCaseClick(item.id)}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-purple-50 rounded-lg p-2.5 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                  <span className="text-sm text-gray-700 group-hover:text-purple-700">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-purple-600">
                  {item.count}+ 次查看
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Categories */}
      {trendingCategories.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">热门知识分类</div>
          <div className="flex flex-wrap gap-2">
            {trendingCategories.map((item) => (
              <button
                key={item.id}
                onClick={() => onCategoryClick(item.id)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
