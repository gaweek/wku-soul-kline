import React from 'react';
import { TrendingUp, User } from 'lucide-react';

export interface Case {
  id: string;
  title: string;
  persona: string;
  curveType: string;
  thumbnail?: string;
  description?: string;
}

interface CaseCardProps {
  case: Case;
  onClick: () => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ case: caseData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        {caseData.thumbnail ? (
          <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={caseData.thumbnail}
              alt={caseData.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-indigo-600" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {caseData.title}
          </h3>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <User className="w-3 h-3" />
              {caseData.persona}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              {caseData.curveType}
            </span>
          </div>

          {/* Description */}
          {caseData.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {caseData.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseCard;
