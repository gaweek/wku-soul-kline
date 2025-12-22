import React from 'react';
import { Eye, Share2, Download, Lock, TrendingUp, Star } from 'lucide-react';

export interface Report {
  id: string;
  title: string;
  timestamp: string;
  summary?: string;
  score?: number;
  peakYear?: number;
  name?: string;
  gender?: string;
  isLocked?: boolean;
}

interface ReportCardProps {
  report: Report;
  onView: () => void;
  onShare: () => void;
  isLocked?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onShare,
  isLocked = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 relative">
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">登录后查看完整报告</p>
            <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              立即登录
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {report.title || `${report.name || '匿名'}的人生K线报告`}
          </h3>
          <p className="text-xs text-gray-500">{report.timestamp}</p>
        </div>
      </div>

      {/* Summary */}
      {report.summary && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {report.summary}
        </p>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        {report.score !== undefined && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-gray-700">
              评分: {report.score}/100
            </span>
          </div>
        )}
        {report.peakYear !== undefined && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">
              巅峰: {report.peakYear}岁
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          查看详情
        </button>
        <button
          onClick={onShare}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="分享"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={() => console.log('Download report:', report.id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="导出"
        >
          <Download className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
