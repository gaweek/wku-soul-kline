
import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Label,
  LabelList,
  Brush
} from 'recharts';
import { KLinePoint } from '../types';

interface LifeKLineChartProps {
  data: KLinePoint[];
  currentAge?: number;
  onYearClick?: (year: number) => void;
}

// Moving Average calculation utility
function calculateMA(data: KLinePoint[], period: number): (number | null)[] {
  return data.map((_, index) => {
    if (index < period - 1) return null;
    const slice = data.slice(index - period + 1, index + 1);
    const sum = slice.reduce((acc, d) => acc + d.score, 0);
    return Math.round((sum / period) * 10) / 10;
  });
}

// Da Yun zone interface
interface DaYunZone {
  daYun: string | undefined;
  startAge: number;
  endAge: number;
  index: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as KLinePoint;
    const isUp = data.close >= data.open;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-gray-200 z-50 w-[90vw] max-w-[320px] md:max-w-[400px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
          <div>
            <p className="text-xl font-bold text-gray-800 font-serif-sc">
              {data.year} {data.ganZhi}年 <span className="text-base text-gray-500 font-sans">({data.age}岁)</span>
            </p>
            <p className="text-sm text-indigo-600 font-medium mt-1">
              大运：{data.daYun || '未知'}
            </p>
          </div>
          <div className={`text-base font-bold px-2 py-1 rounded ${isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isUp ? '吉 ▲' : '凶 ▼'}
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
          <div className="text-center">
            <span className="block scale-90">开盘</span>
            <span className="font-mono text-gray-700 font-bold">{data.open}</span>
          </div>
          <div className="text-center">
            <span className="block scale-90">收盘</span>
            <span className="font-mono text-gray-700 font-bold">{data.close}</span>
          </div>
          <div className="text-center">
            <span className="block scale-90">最高</span>
            <span className="font-mono text-gray-700 font-bold">{data.high}</span>
          </div>
          <div className="text-center">
            <span className="block scale-90">最低</span>
            <span className="font-mono text-gray-700 font-bold">{data.low}</span>
          </div>
        </div>

        {/* MA Info */}
        <div className="flex gap-4 text-xs mb-3">
          {(data as any).ma5 && (
            <span className="text-indigo-500">MA5: {(data as any).ma5}</span>
          )}
          {(data as any).ma10 && (
            <span className="text-amber-500">MA10: {(data as any).ma10}</span>
          )}
        </div>

        {/* Detailed Reason */}
        <div className="text-sm text-gray-700 leading-relaxed text-justify max-h-[200px] overflow-y-auto custom-scrollbar">
          {data.reason}
        </div>
      </div>
    );
  }
  return null;
};

// Gradient CandleShape with glow effects for extreme scores
const GradientCandleShape = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;

  const isUp = payload.close >= payload.open;
  const isExtreme = payload.score > 90 || payload.score < 10;

  // Use gradient fill
  const fillId = isUp ? 'url(#gradientUp)' : 'url(#gradientDown)';
  const strokeColor = isUp ? '#047857' : '#BE123C'; // emerald-700 / rose-700

  let highY = y;
  let lowY = y + height;

  if (yAxis && typeof yAxis.scale === 'function') {
    try {
      highY = yAxis.scale(payload.high);
      lowY = yAxis.scale(payload.low);
    } catch (e) {
      highY = y;
      lowY = y + height;
    }
  }

  const center = x + width / 2;

  // Enforce minimum body height so flat doji candles are visible
  const renderHeight = height < 2 ? 2 : height;

  // Glow effect for extreme scores
  const glowFilter = isExtreme ? 'url(#glowFilter)' : 'none';

  return (
    <g filter={glowFilter}>
      {/* Wick - made slightly thicker for visibility */}
      <line
        x1={center}
        y1={highY}
        x2={center}
        y2={lowY}
        stroke={strokeColor}
        strokeWidth={2}
      />
      {/* Body with gradient */}
      <rect
        x={x}
        y={y}
        width={width}
        height={renderHeight}
        fill={fillId}
        stroke={strokeColor}
        strokeWidth={1}
        rx={2}
        ry={2}
      />
    </g>
  );
};

// Custom Label Component for the Peak Star
const PeakLabel = (props: any) => {
  const { x, y, width, value, maxHigh } = props;

  // Only render if this value equals the global max high
  if (value !== maxHigh) return null;

  return (
    <g>
      {/* Golden Star Icon */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        transform={`translate(${x + width / 2 - 6}, ${y - 24}) scale(0.5)`}
        fill="#F59E0B" // amber-500
        stroke="#D97706" // amber-600
        strokeWidth="1"
      />
      {/* Score Text */}
      <text
        x={x + width / 2}
        y={y - 28}
        fill="#D97706"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
      >
        {value}
      </text>
    </g>
  );
};

// Trough Label Component
const TroughLabel = (props: any) => {
  const { x, y, width, height, value, minLow } = props;

  if (value !== minLow) return null;

  return (
    <g>
      {/* Down Arrow */}
      <path
        d="M12 22l-6-6h4V8h4v8h4z"
        transform={`translate(${x + width / 2 - 6}, ${y + height + 4}) scale(0.5)`}
        fill="#6B7280" // gray-500
        stroke="#4B5563" // gray-600
        strokeWidth="1"
      />
      <text
        x={x + width / 2}
        y={y + height + 20}
        fill="#4B5563"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
      >
        {value}
      </text>
    </g>
  );
};

// Crosshair Cursor Component
const CrosshairCursor = (props: any) => {
  const { points, width, height, top, left } = props;
  if (!points || !points[0]) return null;

  const { x, y } = points[0];

  return (
    <g>
      {/* Vertical line */}
      <line
        x1={x}
        y1={top || 0}
        x2={x}
        y2={(top || 0) + (height || 400)}
        stroke="#9CA3AF"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      {/* Horizontal line */}
      <line
        x1={left || 0}
        y1={y}
        x2={(left || 0) + (width || 800)}
        y2={y}
        stroke="#9CA3AF"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </g>
  );
};

const LifeKLineChart: React.FC<LifeKLineChartProps> = ({ data, currentAge, onYearClick }) => {
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);

  // Calculate Da Yun background zones
  const daYunZones = useMemo<DaYunZone[]>(() => {
    if (!data || data.length === 0) return [];

    const zones: DaYunZone[] = [];
    let currentDaYun = data[0]?.daYun;
    let startAge = data[0]?.age;

    for (let i = 1; i <= data.length; i++) {
      if (i === data.length || data[i]?.daYun !== currentDaYun) {
        zones.push({
          daYun: currentDaYun,
          startAge,
          endAge: data[i-1]?.age,
          index: zones.length
        });
        if (i < data.length) {
          currentDaYun = data[i]?.daYun;
          startAge = data[i]?.age;
        }
      }
    }
    return zones;
  }, [data]);

  // Calculate MAs and transform data
  const transformedData = useMemo(() => {
    const ma5 = calculateMA(data, 5);
    const ma10 = calculateMA(data, 10);

    return data.map((d, i) => ({
      ...d,
      bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
      labelPoint: d.high,
      ma5: ma5[i],
      ma10: ma10[i],
    }));
  }, [data]);

  // Identify Da Yun change points for reference lines
  const daYunChanges = useMemo(() => {
    return data.filter((d, i) => {
      if (i === 0) return true;
      return d.daYun !== data[i-1].daYun;
    });
  }, [data]);

  // Calculate Global Max High and Min Low
  const maxHigh = useMemo(() =>
    data.length > 0 ? Math.max(...data.map(d => d.high)) : 100,
    [data]
  );

  const minLow = useMemo(() =>
    data.length > 0 ? Math.min(...data.map(d => d.low)) : 0,
    [data]
  );

  // Calculate default brush range based on current age
  const defaultBrushIndex = useMemo(() => {
    if (!currentAge || !data.length) return { start: 0, end: Math.min(30, data.length - 1) };
    const currentIndex = data.findIndex(d => d.age === currentAge);
    if (currentIndex === -1) return { start: 0, end: Math.min(30, data.length - 1) };

    const start = Math.max(0, currentIndex - 15);
    const end = Math.min(data.length - 1, currentIndex + 15);
    return { start, end };
  }, [currentAge, data]);

  if (!data || data.length === 0) {
    return <div className="h-[350px] sm:h-[450px] lg:h-[500px] flex items-center justify-center text-gray-400">无数据</div>;
  }

  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[650px] bg-white p-2 md:p-6 rounded-xl border border-gray-200 shadow-sm relative">
      {/* Header with Legend */}
      <div className="mb-4 flex flex-wrap justify-between items-center px-2 gap-2">
        <h3 className="text-xl font-bold text-gray-800 font-serif-sc">人生流年大运K线图</h3>
        <div className="flex flex-wrap gap-2 md:gap-4 text-xs font-medium">
          <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
            <div className="w-2 h-2 bg-emerald-500 mr-2 rounded-full"></div> 吉运 (涨)
          </span>
          <span className="flex items-center text-rose-700 bg-rose-50 px-2 py-1 rounded">
            <div className="w-2 h-2 bg-rose-500 mr-2 rounded-full"></div> 凶运 (跌)
          </span>
          <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            <div className="w-3 h-0.5 bg-indigo-400 mr-2"></div> MA5
          </span>
          <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded">
            <div className="w-3 h-0.5 bg-amber-400 mr-2"></div> MA10
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart
          data={transformedData}
          margin={{ top: 30, right: 10, left: 0, bottom: 50 }}
          onClick={(e) => {
            if (e?.activePayload?.[0]?.payload && onYearClick) {
              onYearClick(e.activePayload[0].payload.year);
            }
          }}
        >
          {/* SVG Definitions for Gradients and Filters */}
          <defs>
            {/* Gradient for bullish (up) candles - emerald */}
            <linearGradient id="gradientUp" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#047857" stopOpacity={1} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
            </linearGradient>

            {/* Gradient for bearish (down) candles - rose */}
            <linearGradient id="gradientDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BE123C" stopOpacity={1} />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity={1} />
            </linearGradient>

            {/* Glow filter for extreme scores */}
            <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Da Yun Background Zones - render first so they're behind everything */}
          {daYunZones.map((zone, idx) => (
            <ReferenceArea
              key={`zone-${idx}`}
              x1={zone.startAge}
              x2={zone.endAge}
              fill={idx % 2 === 0 ? '#f0f9ff' : '#faf5ff'}
              fillOpacity={0.6}
              stroke="none"
            />
          ))}

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />

          <XAxis
            dataKey="age"
            tick={{fontSize: 10, fill: '#6b7280'}}
            interval={9}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            label={{ value: '年龄', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#9ca3af' }}
          />

          <YAxis
            domain={[0, 'auto']}
            tick={{fontSize: 10, fill: '#6b7280'}}
            axisLine={false}
            tickLine={false}
            label={{ value: '运势分', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={<CrosshairCursor />}
          />

          {/* Da Yun Reference Lines with Labels */}
          {daYunChanges.map((point, index) => (
            <ReferenceLine
              key={`dayun-${index}`}
              x={point.age}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth={1}
            >
              <Label
                value={point.daYun}
                position="top"
                fill="#6366f1"
                fontSize={10}
                fontWeight="bold"
              />
            </ReferenceLine>
          ))}

          {/* Current Age Marker */}
          {currentAge && (
            <ReferenceLine
              x={currentAge}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="none"
            >
              <Label
                value="今"
                position="top"
                fill="#F59E0B"
                fontSize={12}
                fontWeight="bold"
              />
            </ReferenceLine>
          )}

          {/* MA10 Line (behind MA5) */}
          <Line
            type="monotone"
            dataKey="ma10"
            stroke="#FBBF24"
            dot={false}
            strokeWidth={1.5}
            name="MA10"
            connectNulls
          />

          {/* MA5 Line */}
          <Line
            type="monotone"
            dataKey="ma5"
            stroke="#818CF8"
            dot={false}
            strokeWidth={2}
            name="MA5"
            connectNulls
          />

          {/* K-Line Candles with Gradient */}
          <Bar
            dataKey="bodyRange"
            shape={<GradientCandleShape />}
            isAnimationActive={true}
            animationDuration={1500}
          >
            {/* Peak Label */}
            <LabelList
              dataKey="high"
              position="top"
              content={<PeakLabel maxHigh={maxHigh} />}
            />
          </Bar>

          {/* Brush for zoom/pan */}
          <Brush
            dataKey="age"
            height={30}
            stroke="#6366f1"
            fill="#f5f3ff"
            startIndex={defaultBrushIndex.start}
            endIndex={defaultBrushIndex.end}
            travellerWidth={10}
          />

        </ComposedChart>
      </ResponsiveContainer>

      {/* Instruction hint */}
      <p className="text-center text-xs text-gray-400 mt-1">
        拖动底部滑块可缩放查看 • 点击K线可查看月度详情
      </p>
    </div>
  );
};

export default LifeKLineChart;
