import React from 'react';
import { User, Star, ArrowRight, Info, Sparkles, AlertCircle } from 'lucide-react';
import { BaziSimilarity } from '../../types';
import { KnowledgeTerm } from './KnowledgeTerm';

interface BaziComparisonPanelProps {
  userBazi: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
  };
  celebrityBazi: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
  };
  celebrityName: string;
  similarity: BaziSimilarity;
  className?: string;
}

/**
 * BaziComparisonPanel - 八字对比面板
 * 展示用户与名人的八字对比和相似度分析
 */
export const BaziComparisonPanel: React.FC<BaziComparisonPanelProps> = ({
  userBazi,
  celebrityBazi,
  celebrityName,
  similarity,
  className = '',
}) => {
  const pillars = [
    { key: 'yearPillar', label: '年柱', match: similarity.yearPillarMatch },
    { key: 'monthPillar', label: '月柱', match: similarity.monthPillarMatch },
    { key: 'dayPillar', label: '日柱', match: similarity.dayPillarMatch },
    { key: 'hourPillar', label: '时柱', match: similarity.hourPillarMatch },
  ] as const;

  // Get color for match percentage
  const getMatchColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 40) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  // Get text color for match percentage
  const getMatchTextColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 40) return 'text-amber-600';
    return 'text-gray-500';
  };

  // Get overall score color
  const getOverallScoreColor = () => {
    const score = similarity.overallScore;
    if (score >= 80) return 'from-amber-400 to-orange-500 text-white';
    if (score >= 60) return 'from-blue-500 to-indigo-600 text-white';
    if (score >= 40) return 'from-slate-400 to-slate-500 text-white';
    return 'from-gray-300 to-gray-400 text-gray-700';
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header with Overall Score */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-lg">八字相似度对比</h3>
          </div>

          {/* Big Score Circle */}
          <div className={`
            w-16 h-16 rounded-full
            bg-gradient-to-br ${getOverallScoreColor()}
            flex flex-col items-center justify-center
            shadow-lg ring-4 ring-white/30
          `}>
            <span className="text-2xl font-bold">{Math.round(similarity.overallScore)}</span>
            <span className="text-[10px] opacity-80">%</span>
          </div>
        </div>

        {/* Day Master Relation */}
        <div className="mt-3 flex items-center gap-2 text-indigo-100 text-sm">
          <Info className="w-4 h-4" />
          <span>
            <KnowledgeTerm term="日主" className="text-white underline decoration-dotted">日主</KnowledgeTerm>
            关系：{similarity.dayMasterRelation}
          </span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-6">
        {/* Labels Row */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 mb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
            <User className="w-4 h-4" />
            <span>你的八字</span>
          </div>
          <div className="w-20"></div>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
            <Star className="w-4 h-4" />
            <span>{celebrityName}</span>
          </div>
        </div>

        {/* Pillars Comparison */}
        <div className="space-y-4">
          {pillars.map(({ key, label, match }) => (
            <div key={key} className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
              {/* User Pillar */}
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-2xl font-serif-sc font-bold text-gray-800">
                  {userBazi[key] || '--'}
                </div>
              </div>

              {/* Match Indicator */}
              <div className="w-20 flex flex-col items-center gap-1">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getMatchColor(match)} transition-all duration-500`}
                    style={{ width: `${match}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${getMatchTextColor(match)}`}>
                  {Math.round(match)}%
                </span>
              </div>

              {/* Celebrity Pillar */}
              <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                <div className="text-xs text-amber-600 mb-1">{label}</div>
                <div className="text-2xl font-serif-sc font-bold text-amber-800">
                  {celebrityBazi[key] || '--'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Element Balance */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">
              <KnowledgeTerm term="五行" className="underline decoration-dotted">五行</KnowledgeTerm>
              平衡相似度
            </span>
            <span className={`text-lg font-bold ${getMatchTextColor(similarity.elementBalance)}`}>
              {Math.round(similarity.elementBalance)}%
            </span>
          </div>
        </div>

        {/* Insights */}
        {similarity.insights && similarity.insights.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              相似度洞察
            </h4>
            <ul className="space-y-2">
              {similarity.insights.map((insight, index) => (
                <li
                  key={index}
                  className={`
                    text-sm p-3 rounded-lg flex items-start gap-2
                    ${insight.includes('⚠️')
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-gray-50 text-gray-600'
                    }
                  `}
                >
                  {insight.includes('⚠️') ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-indigo-500" />
                  )}
                  <span>{insight.replace('⚠️ ', '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact version for sidebars or cards
 */
export const BaziComparisonCompact: React.FC<{
  similarity: BaziSimilarity;
  celebrityName: string;
  onViewDetails?: () => void;
  className?: string;
}> = ({ similarity, celebrityName, onViewDetails, className = '' }) => {
  const score = similarity.overallScore;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Score Circle */}
        <div className={`
          w-14 h-14 rounded-full flex-shrink-0
          bg-gradient-to-br ${
            score >= 80 ? 'from-amber-400 to-orange-500' :
            score >= 60 ? 'from-blue-500 to-indigo-600' :
            'from-gray-400 to-gray-500'
          }
          text-white flex flex-col items-center justify-center
          shadow-md
        `}>
          <span className="text-xl font-bold">{Math.round(score)}</span>
          <span className="text-[10px]">%</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-500">
            与 <span className="font-medium text-gray-800">{celebrityName}</span> 的相似度
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {similarity.dayMasterRelation}
          </div>
        </div>

        {/* Action */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            详情
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BaziComparisonPanel;
