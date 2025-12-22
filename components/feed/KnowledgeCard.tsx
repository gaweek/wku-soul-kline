import React from 'react';
import { BookOpen, Eye, Tag } from 'lucide-react';

export interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  views?: number;
  thumbnail?: string;
  tags?: string[];
}

interface KnowledgeCardProps {
  article: Article;
  onClick: () => void;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ article, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4"
    >
      <div className="flex gap-4">
        {/* Thumbnail or Icon */}
        {article.thumbnail ? (
          <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-28 h-28 flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-amber-600" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category Tag */}
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {article.summary}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {article.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views.toLocaleString()} 阅读</span>
              </div>
            )}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {article.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeCard;
