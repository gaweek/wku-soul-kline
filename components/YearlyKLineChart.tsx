import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calendar, TrendingUp, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyKLinePoint {
  year: number;
  month: number;
  age: number;
  ganZhi: string;
  liuNian: string;
  daYun: string;
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  keyword: string;
  summary: string;
}

interface YearlyKLineData {
  monthlyPoints: MonthlyKLinePoint[];
  bestMonths: Array<{ year: number; month: number; reason: string }>;
  worstMonths: Array<{ year: number; month: number; reason: string }>;
  yearlyTrends: Record<number, { avgScore: number; theme: string; keywords: string[] }>;
}

interface YearlyKLineChartProps {
  profileId: string | null;
  onViewDetail?: (point: MonthlyKLinePoint) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as MonthlyKLinePoint;
    const isUp = data.close >= data.open;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 z-50 max-w-[300px]">
        <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
          <div>
            <p className="text-lg font-bold text-gray-800">
              {data.year}年{data.month}月
            </p>
            <p className="text-sm text-indigo-600">{data.ganZhi}月 ({data.keyword})</p>
          </div>
          <div className={`text-sm font-bold px-2 py-1 rounded ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isUp ? '吉 ▲' : '凶 ▼'}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          <div className="text-center">
            <span className="block">开</span>
            <span className="font-mono text-gray-700 font-bold">{data.open}</span>
          </div>
          <div className="text-center">
            <span className="block">收</span>
            <span className="font-mono text-gray-700 font-bold">{data.close}</span>
          </div>
          <div className="text-center">
            <span className="block">高</span>
            <span className="font-mono text-gray-700 font-bold">{data.high}</span>
          </div>
          <div className="text-center">
            <span className="block">低</span>
            <span className="font-mono text-gray-700 font-bold">{data.low}</span>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><span className="text-gray-400">流年:</span> {data.liuNian}</p>
          <p><span className="text-gray-400">大运:</span> {data.daYun}</p>
        </div>
      </div>
    );
  }
  return null;
};

const CandleShape = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;

  const isUp = payload.close >= payload.open;
  // Use gradient fill IDs (defined in parent chart)
  const fillId = isUp ? 'url(#gradientUpMonthly)' : 'url(#gradientDownMonthly)';
  const strokeColor = isUp ? '#047857' : '#BE123C'; // emerald-700 / rose-700

  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high);
      lowY = yAxis.scale(payload.low);
    } catch {
      highY = y;
      lowY = y + height;
    }
  }

  const center = x + width / 2;
  const renderHeight = height < 2 ? 2 : height;

  // Glow effect for extreme scores
  const isExtreme = payload.score > 90 || payload.score < 10;
  const glowFilter = isExtreme ? 'url(#glowFilterMonthly)' : 'none';

  return (
    <g filter={glowFilter}>
      <line x1={center} y1={highY} x2={center} y2={Math.min(y, y + renderHeight)} stroke={strokeColor} strokeWidth={1.5} />
      <line x1={center} y1={Math.max(y, y + renderHeight)} x2={center} y2={lowY} stroke={strokeColor} strokeWidth={1.5} />
      <rect x={x} y={y} width={width} height={renderHeight} fill={fillId} stroke={strokeColor} strokeWidth={1} rx={2} />
    </g>
  );
};

export const YearlyKLineChart: React.FC<YearlyKLineChartProps> = ({ profileId, onViewDetail }) => {
  const [data, setData] = useState<YearlyKLineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (profileId) {
      fetchKLineData();
    }
  }, [profileId]);

  const fetchKLineData = async () => {
    if (!profileId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kline/yearly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profileId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || '获取K线数据失败');
      }

      const result = await response.json();
      setData(result.kline);
      setYears(result.years);
      setSelectedYear(result.years[1]); // Default to current year
    } catch (err: any) {
      setError(err.message || '获取K线数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (!profileId) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-gray-800">36月K线</h3>
        </div>
        <p className="text-sm text-gray-500">选择档案查看36月运势K线图</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-gray-600">正在生成K线数据...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-800">加载失败</h3>
        </div>
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={fetchKLineData}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-gray-800">36月K线</h3>
          <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">免费</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">查看未来三年(36个月)的运势走势图</p>
        <button
          onClick={fetchKLineData}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          生成K线图
        </button>
      </div>
    );
  }

  // Filter data by selected year
  const filteredData = selectedYear
    ? data.monthlyPoints.filter(p => p.year === selectedYear)
    : data.monthlyPoints;

  // Calculate chart data range
  const minScore = Math.min(...filteredData.map(d => d.low));
  const maxScore = Math.max(...filteredData.map(d => d.high));

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold">36月K线图</h3>
            <span className="px-1.5 py-0.5 bg-white/20 text-xs rounded-full">免费</span>
          </div>
          <div className="flex items-center gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedYear === year
                    ? 'bg-white text-indigo-600 font-bold'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Year Summary */}
      {selectedYear && data.yearlyTrends[selectedYear] && (
        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {selectedYear}年均分:
              <span className="font-bold text-indigo-600 ml-1">
                {data.yearlyTrends[selectedYear].avgScore}
              </span>
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              {data.yearlyTrends[selectedYear].theme}
            </span>
          </div>
          <div className="flex gap-1">
            {data.yearlyTrends[selectedYear].keywords.map((kw, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-4 py-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              {/* SVG Definitions for Gradients */}
              <defs>
                <linearGradient id="gradientUpMonthly" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#047857" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="gradientDownMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BE123C" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={1} />
                </linearGradient>
                <filter id="glowFilterMonthly" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickFormatter={(m) => `${m}月`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis
                domain={[Math.max(0, minScore - 10), Math.min(100, maxScore + 10)]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={55} stroke="#6366f1" strokeDasharray="5 5" label={{ value: '中位线', fill: '#6366f1', fontSize: 10 }} />
              <Bar
                dataKey="close"
                shape={<CandleShape />}
                barSize={18}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best/Worst Months */}
      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 mb-2">吉月</p>
          <div className="space-y-1">
            {data.bestMonths.slice(0, 2).map((m, i) => (
              <div key={i} className="text-xs text-green-600">
                {m.year}.{m.month} - {m.reason.split(' - ')[0]}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <p className="text-xs font-medium text-red-700 mb-2">凶月</p>
          <div className="space-y-1">
            {data.worstMonths.slice(0, 2).map((m, i) => (
              <div key={i} className="text-xs text-red-600">
                {m.year}.{m.month} - {m.reason.split(' - ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyKLineChart;
