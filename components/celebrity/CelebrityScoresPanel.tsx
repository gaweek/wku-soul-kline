import React from 'react';
import { Star, TrendingUp, Heart, Wallet, Users, Activity } from 'lucide-react';
import { CelebrityScores } from '../../types';

interface CelebrityScoresPanelProps {
  scores: CelebrityScores;
  celebrityName: string;
  className?: string;
}

const scoreLabels = {
  overall: { label: '总体命格', icon: Star, color: 'from-purple-500 to-indigo-500' },
  personality: { label: '性格', icon: Users, color: 'from-blue-500 to-cyan-500' },
  career: { label: '事业', icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
  wealth: { label: '财富', icon: Wallet, color: 'from-yellow-500 to-amber-500' },
  marriage: { label: '婚姻', icon: Heart, color: 'from-rose-500 to-pink-500' },
  health: { label: '健康', icon: Activity, color: 'from-red-500 to-orange-500' },
};

const getScoreLevel = (score: number): { text: string; color: string } => {
  if (score >= 90) return { text: '顶级', color: 'text-purple-600' };
  if (score >= 75) return { text: '优秀', color: 'text-green-600' };
  if (score >= 60) return { text: '良好', color: 'text-blue-600' };
  if (score >= 45) return { text: '中等', color: 'text-amber-600' };
  if (score >= 30) return { text: '待提升', color: 'text-orange-600' };
  return { text: '需注意', color: 'text-red-600' };
};

const ScoreBar: React.FC<{
  type: keyof typeof scoreLabels;
  score: number;
}> = ({ type, score }) => {
  const config = scoreLabels[type];
  const Icon = config.icon;
  const level = getScoreLevel(score);

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{config.label}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${level.color}`}>{level.text}</span>
            <span className="text-sm font-bold text-gray-800">{score}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const CelebrityScoresPanel: React.FC<CelebrityScoresPanelProps> = ({
  scores,
  celebrityName,
  className = ''
}) => {
  const overallLevel = getScoreLevel(scores.overall);

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header with overall score */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">命理评分</h3>
            <p className="text-indigo-200 text-sm">{celebrityName}</p>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${scores.overall * 2.64} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{scores.overall}</span>
                <span className="text-xs text-indigo-200">{overallLevel.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual scores */}
      <div className="p-6 space-y-4">
        <ScoreBar type="personality" score={scores.personality} />
        <ScoreBar type="career" score={scores.career} />
        <ScoreBar type="wealth" score={scores.wealth} />
        <ScoreBar type="marriage" score={scores.marriage} />
        <ScoreBar type="health" score={scores.health} />
      </div>

      {/* Footer note */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-500 text-center">
          评分基于八字命理结构分析，仅供参考
        </p>
      </div>
    </div>
  );
};

export default CelebrityScoresPanel;
