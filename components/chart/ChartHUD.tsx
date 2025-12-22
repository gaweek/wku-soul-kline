import React from 'react';
import { TrendingUp, TrendingDown, Calendar, Star } from 'lucide-react';
import { KLinePoint } from '../../types';

interface ChartHUDProps {
  data: KLinePoint | null;
  ma5?: number | null;
  ma10?: number | null;
  className?: string;
}

/**
 * HUD (Heads-Up Display) Info Panel
 * Fixed position panel showing current hovered data point info
 * Alternative to traditional tooltip - doesn't obscure chart content
 */
const ChartHUD: React.FC<ChartHUDProps> = ({ data, ma5, ma10, className = '' }) => {
  if (!data) {
    return (
      <div className={`bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-3 ${className}`}>
        <p className="text-gray-400 text-sm text-center">移动鼠标查看详情</p>
      </div>
    );
  }

  const isUp = data.close >= data.open;
  const change = data.close - data.open;
  const changePercent = data.open > 0 ? ((change / data.open) * 100).toFixed(1) : '0.0';

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className={`px-3 py-2 rounded-t-lg ${isUp ? 'bg-emerald-50' : 'bg-rose-50'} border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 font-serif-sc">
              {data.year}年
            </span>
            <span className="text-gray-500 text-sm">
              {data.ganZhi}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-bold text-sm">
              {isUp ? '+' : ''}{changePercent}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Calendar className="w-3 h-3 text-indigo-500" />
          <span className="text-xs text-indigo-600 font-medium">
            {data.daYun || '—'} 大运
          </span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">
            {data.age}岁
          </span>
        </div>
      </div>

      {/* OHLC Data Grid */}
      <div className="grid grid-cols-4 gap-1 p-2 text-center border-b border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">开盘</p>
          <p className="font-mono text-sm font-bold text-gray-700">{data.open}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">收盘</p>
          <p className={`font-mono text-sm font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {data.close}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">最高</p>
          <p className="font-mono text-sm font-bold text-amber-600">{data.high}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">最低</p>
          <p className="font-mono text-sm font-bold text-gray-500">{data.low}</p>
        </div>
      </div>

      {/* Score & MA */}
      <div className="p-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className={`w-4 h-4 ${data.score >= 70 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            <span className="text-sm font-bold text-gray-700">
              运势分: {data.score}
            </span>
          </div>
          <div className="flex gap-3 text-xs">
            {ma5 !== null && ma5 !== undefined && (
              <span className="text-indigo-500">
                MA5: <span className="font-mono font-bold">{ma5}</span>
              </span>
            )}
            {ma10 !== null && ma10 !== undefined && (
              <span className="text-amber-500">
                MA10: <span className="font-mono font-bold">{ma10}</span>
              </span>
            )}
          </div>
        </div>

        {/* MA Relationship */}
        {ma5 !== null && ma5 !== undefined && (
          <div className="mt-1">
            <span className={`text-xs ${data.score > ma5 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {data.score > ma5 ? '▲ 高于均线 (顺势)' : '▼ 低于均线 (逆势)'}
            </span>
          </div>
        )}
      </div>

      {/* Brief Reason */}
      {data.reason && (
        <div className="p-2">
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
            {data.reason.slice(0, 80)}...
          </p>
        </div>
      )}
    </div>
  );
};

export default ChartHUD;
