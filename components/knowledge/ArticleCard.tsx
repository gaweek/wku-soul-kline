import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Eye, ArrowRight } from 'lucide-react';
import { KnowledgeArticle, getCategoryName } from '../../services/contentService';

interface ArticleCardProps {
  article: KnowledgeArticle;
}

// 分类颜色映射
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  quickstart: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  kline: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  bazi: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  dayun: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  method: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  faq: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const colors = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.faq;

  return (
    <Link
      to={`/knowledge/${article.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-5">
        {/* Category Tag */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
            <BookOpen className="w-3 h-3" />
            {getCategoryName(article.category)}
          </span>
          {article.viewCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3 h-3" />
              {article.viewCount}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(article.createdAt).toLocaleDateString('zh-CN')}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
          阅读文章
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
