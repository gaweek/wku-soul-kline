import React, { useRef } from 'react';
import { Download, X, QrCode, Star, TrendingUp } from 'lucide-react';
import html2canvas from 'html2canvas';
import { CelebrityCase, CelebrityScores, KLinePoint } from '../../types';

interface CelebrityPosterProps {
  celebrity: CelebrityCase;
  scores?: CelebrityScores | null;
  chartData?: KLinePoint[];
  onClose?: () => void;
}

const CelebrityPoster: React.FC<CelebrityPosterProps> = ({
  celebrity,
  scores,
  chartData = [],
  onClose,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#0F172A',
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `life-kline-${celebrity.nameCn || celebrity.name}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('生成海报失败:', err);
    }
  };

  // Get mini chart data (last 10 years or next 10 years)
  const currentYear = new Date().getFullYear();
  const miniChartData = chartData
    .filter(p => p.year >= currentYear - 5 && p.year <= currentYear + 5)
    .slice(0, 10);

  // Calculate mini chart dimensions
  const chartWidth = 280;
  const chartHeight = 80;
  const maxScore = Math.max(...miniChartData.map(p => p.score), 80);
  const minScore = Math.min(...miniChartData.map(p => p.score), 20);
  const scoreRange = maxScore - minScore || 1;

  const getY = (score: number) =>
    chartHeight - ((score - minScore) / scoreRange) * (chartHeight - 10) - 5;

  const pathD = miniChartData.length > 1
    ? miniChartData
        .map((p, i) => {
          const x = (i / (miniChartData.length - 1)) * chartWidth;
          const y = getY(p.score);
          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        })
        .join(' ')
    : '';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-sm w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Poster */}
        <div
          ref={posterRef}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden"
          style={{ width: '320px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-6 py-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{celebrity.nameCn}</h2>
                <p className="text-indigo-200 text-sm">{celebrity.name}</p>
              </div>
            </div>
            <p className="text-indigo-100 text-xs">{celebrity.categoryCn}</p>
          </div>

          {/* BaZi */}
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-gray-400 text-xs mb-2">八字四柱</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: '年', value: celebrity.yearPillar },
                { label: '月', value: celebrity.monthPillar },
                { label: '日', value: celebrity.dayPillar },
                { label: '时', value: celebrity.hourPillar },
              ].map((pillar, index) => (
                <div key={index} className="bg-white/5 rounded-lg py-2 px-1">
                  <p className="text-gray-500 text-xs mb-1">{pillar.label}柱</p>
                  <p className="text-white font-bold">{pillar.value || '--'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scores */}
          {scores && (
            <div className="px-6 py-4 border-b border-white/10">
              <p className="text-gray-400 text-xs mb-3">命理评分</p>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center mb-1">
                    <span className="text-2xl font-bold text-white">{scores.overall}</span>
                  </div>
                  <p className="text-gray-400 text-xs">总评</p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2 ml-4">
                  {[
                    { label: '事业', value: scores.career },
                    { label: '财富', value: scores.wealth },
                    { label: '健康', value: scores.health },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <p className="text-white font-bold text-lg">{item.value}</p>
                      <p className="text-gray-500 text-xs">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mini Chart */}
          {miniChartData.length > 1 && (
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <p className="text-gray-400 text-xs">运势走势</p>
              </div>
              <svg width={chartWidth} height={chartHeight} className="mx-auto">
                <defs>
                  <linearGradient id="posterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d={`${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                  fill="url(#posterGradient)"
                />
                {/* Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Points */}
                {miniChartData.map((p, i) => {
                  const x = (i / (miniChartData.length - 1)) * chartWidth;
                  const y = getY(p.score);
                  const isCurrent = p.year === currentYear;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={isCurrent ? 4 : 2}
                      fill={isCurrent ? '#F59E0B' : '#818CF8'}
                    />
                  );
                })}
              </svg>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">扫码查看完整分析</p>
                <p className="text-indigo-400 text-xs font-medium">人生K线</p>
              </div>
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="px-6 pb-4">
            <p className="text-center text-gray-600 text-xs">
              人生K线 · 自研中华古法命理科学算法 · 仅供娱乐参考
            </p>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          <Download className="w-5 h-5" />
          保存海报
        </button>
      </div>
    </div>
  );
};

export default CelebrityPoster;
