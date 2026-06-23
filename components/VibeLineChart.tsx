import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  VibeLineAgentStatusMap,
  VibeLineAgentType,
  VibeLinePoint,
} from '../types/vibeline';

gsap.registerPlugin(useGSAP);

interface VibeLineChartProps {
  data: VibeLinePoint[];
  loading?: boolean;
  modeLabel?: string;
  loadingText?: string;
  agentStatuses?: VibeLineAgentStatusMap;
}

interface PlotPoint extends VibeLinePoint {
  stageName: string;
  x: number;
  y: number;
  highY: number;
  lowY: number;
  volumeHeight: number;
  delta: number;
}

interface StageGroup {
  name: string;
  startX: number;
  endX: number;
  centerX: number;
  count: number;
  startIndex: number;
}

interface PointerPoint {
  x: number;
  y: number;
}

interface TooltipBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type TooltipPlacement = 'left' | 'right' | 'top' | 'bottom';

const VIEWBOX_WIDTH = 1040;
const VIEWBOX_HEIGHT = 460;
const PAD_X = 58;
const CHART_TOP = 34;
const CHART_BOTTOM = 304;
const VOLUME_TOP = 330;
const VOLUME_HEIGHT = 52;
const SCORE_RANGE = 100;

const previewPath = 'M 58 250 C 150 212, 228 208, 316 186 C 408 164, 480 232, 560 204 C 650 172, 710 112, 810 126 C 900 136, 944 112, 982 92';
const previewAreaPath = `${previewPath} L 982 304 L 58 304 Z`;

const scoreToY = (score: number) => {
  const clamped = Math.max(0, Math.min(100, score));
  return CHART_BOTTOM - (clamped / SCORE_RANGE) * (CHART_BOTTOM - CHART_TOP);
};

const clamp = (value: number, min: number, max: number) => {
  if (min > max) return (min + max) / 2;
  return Math.max(min, Math.min(max, value));
};

const getOverlapArea = (first: TooltipBox, second: TooltipBox) => {
  const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
  const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
  return width * height;
};

const getOverflowScore = (box: TooltipBox, bounds: TooltipBox) => (
  Math.max(0, bounds.left - box.left)
  + Math.max(0, box.right - bounds.right)
  + Math.max(0, bounds.top - box.top)
  + Math.max(0, box.bottom - bounds.bottom)
);

const chooseTooltipPlacement = (
  point: PlotPoint,
  rect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPlacement => {
  const pointX = (point.x / VIEWBOX_WIDTH) * rect.width;
  const pointY = (point.y / VIEWBOX_HEIGHT) * rect.height;
  const gutter = 18;
  const avoidRect: TooltipBox = {
    left: pointX - 54,
    top: pointY - 42,
    right: pointX + 54,
    bottom: pointY + 42,
  };
  const bounds: TooltipBox = {
    left: 12,
    top: 12,
    right: rect.width - 12,
    bottom: rect.height - 12,
  };
  const boxes: Record<TooltipPlacement, TooltipBox> = {
    top: {
      left: pointX - tooltipWidth / 2,
      top: pointY - tooltipHeight - gutter,
      right: pointX + tooltipWidth / 2,
      bottom: pointY - gutter,
    },
    bottom: {
      left: pointX - tooltipWidth / 2,
      top: pointY + gutter,
      right: pointX + tooltipWidth / 2,
      bottom: pointY + tooltipHeight + gutter,
    },
    left: {
      left: pointX - tooltipWidth - gutter,
      top: pointY - tooltipHeight / 2,
      right: pointX - gutter,
      bottom: pointY + tooltipHeight / 2,
    },
    right: {
      left: pointX + gutter,
      top: pointY - tooltipHeight / 2,
      right: pointX + tooltipWidth + gutter,
      bottom: pointY + tooltipHeight / 2,
    },
  };

  return (Object.keys(boxes) as TooltipPlacement[])
    .map((placement) => {
      const box = boxes[placement];
      const overflow = getOverflowScore(box, bounds);
      const overlap = getOverlapArea(box, avoidRect);
      const verticalDockBonus = placement === 'top' || placement === 'bottom' ? -18 : 0;
      const sameHalfPenalty = (
        (placement === 'top' && pointY < rect.height * 0.5)
        || (placement === 'bottom' && pointY > rect.height * 0.5)
      ) ? 36 : 0;

      return {
        placement,
        score: overflow * 6 + overlap * 0.02 + sameHalfPenalty + verticalDockBonus,
      };
    })
    .sort((first, second) => first.score - second.score)[0]?.placement || (pointX > rect.width / 2 ? 'left' : 'right');
};

const buildSmoothPath = (points: Array<{ x: number; y: number }>) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const previous = points[i - 1] || current;
    const afterNext = points[i + 2] || next;
    const controlScale = 0.16;

    const cp1x = current.x + (next.x - previous.x) * controlScale;
    const cp1y = current.y + (next.y - previous.y) * controlScale;
    const cp2x = next.x - (afterNext.x - current.x) * controlScale;
    const cp2y = next.y - (afterNext.y - current.y) * controlScale;

    commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
  }

  return commands.join(' ');
};

const SINGLE_STAGE_PREVIEW = [
  { label: '眼缘停留', detail: '第一眼愿不愿意停下' },
  { label: '想再看看', detail: '看完之后是否还有好奇' },
  { label: '第一句话', detail: '第一句是否容易发生' },
  { label: '同频点亮', detail: '共同点是否被点亮' },
  { label: '慢慢深聊', detail: '是否进入持续交流' },
  { label: '再次想起', detail: '之后还会不会想起你' },
];

const MATCH_STAGE_PREVIEW = [
  { label: '互相注意', detail: '两个人是否都愿意停一下' },
  { label: '靠近意愿', detail: '是否想继续了解彼此' },
  { label: '破冰默契', detail: '第一句能不能自然接住' },
  { label: '共振点亮', detail: '共同兴趣是否真正亮起' },
  { label: '信任升温', detail: '能不能慢慢透露更多' },
  { label: '余温回访', detail: '聊完后是否还想再靠近' },
];

const AGENT_STATUS_ORDER: VibeLineAgentType[] = [
  'persona_asset',
  'resonance_factor',
  'lifecycle_kline',
  'audience_market',
  'narrative_packaging',
  'safety_authenticity',
];

const AGENT_STATUS_LABELS: Record<VibeLineAgentType, string> = {
  persona_asset: '社交画像',
  resonance_factor: '共鸣信号',
  lifecycle_kline: 'K 线生成',
  audience_market: '同频定位',
  narrative_packaging: '表达打磨',
  safety_authenticity: '边界守护',
};

const getStagePreview = (modeLabel = 'Who Know U') => (
  modeLabel === 'Who Know Us' ? MATCH_STAGE_PREVIEW : SINGLE_STAGE_PREVIEW
);

const stageHint = (stage = '', modeLabel = 'Who Know U') => {
  const hints: Record<string, string> = {
    眼缘停留: '第一眼愿不愿意停下',
    想再看看: '看完之后是否还有好奇',
    第一句话: '第一句是否容易发生',
    同频点亮: '共同点是否被点亮',
    慢慢深聊: '是否进入持续交流',
    再次想起: '之后还会不会想起你',
    互相注意: '两个人是否都愿意停一下',
    靠近意愿: '是否想继续了解彼此',
    破冰默契: '第一句能不能自然接住',
    共振点亮: '共同兴趣是否真正亮起',
    信任升温: '能不能慢慢透露更多',
    余温回访: '聊完后是否还想再靠近',
  };
  return hints[stage] || (modeLabel === 'Who Know Us' ? '双人共振阶段' : '连接阶段');
};

const DeltaBadge: React.FC<{ value: number }> = ({ value }) => (
  <span className={`rounded-md px-2 py-1 text-xs font-black ${value >= 0 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
    {value >= 0 ? '+' : ''}{value}
  </span>
);

const LoadingAgentProgress: React.FC<{ agentStatuses?: VibeLineAgentStatusMap }> = ({ agentStatuses }) => {
  if (!agentStatuses) return null;

  const completedCount = AGENT_STATUS_ORDER.filter((type) => agentStatuses[type]?.status === 'completed').length;
  const runningAgent = AGENT_STATUS_ORDER.find((type) => agentStatuses[type]?.status === 'running');
  const runningLabel = runningAgent ? AGENT_STATUS_LABELS[runningAgent] : '等待 Agent 接力';
  const statusLabel = {
    pending: '等待',
    running: '运行中',
    completed: '完成',
    failed: '需重试',
  };

  return (
    <div className="wku-loading-agent-panel" aria-label="六个 Agent 实时进度">
      <div className="wku-loading-agent-head">
        <div>
          <p className="text-xs font-black text-teal-700">六个 Agent 实时进度</p>
          <p className="mt-1 text-sm font-black text-slate-950">当前：{runningLabel}</p>
        </div>
        <span>{completedCount}/6</span>
      </div>
      <div className="wku-loading-agent-grid">
        {AGENT_STATUS_ORDER.map((type) => {
          const item = agentStatuses[type];
          return (
            <div key={type} className={`wku-loading-agent-chip is-${item.status}`}>
              <span className="wku-loading-agent-dot" aria-hidden="true" />
              <span className="wku-loading-agent-name">{AGENT_STATUS_LABELS[type] || item.name}</span>
              <span className="wku-loading-agent-state">{item.elapsed || statusLabel[item.status]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChartLoading: React.FC<{
  modeLabel?: string;
  loadingText?: string;
  agentStatuses?: VibeLineAgentStatusMap;
}> = ({
  modeLabel = 'Who Know U',
  loadingText = 'AI 正在把样本转成连接曲线',
  agentStatuses,
}) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="wku-chip wku-chip-dark">{modeLabel}</span>
          <h2 className="text-lg font-black text-slate-950">正在生成读盘</h2>
        </div>
        <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-600">{loadingText}</p>
      </div>
      <div role="status" aria-live="polite" className="wku-loading-status">
        <span className="wku-loading-status-dot" aria-hidden="true" />
        <span>生成中</span>
      </div>
    </div>
    <div className="relative h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="absolute inset-x-8 top-12 h-px bg-slate-200" />
      <div className="absolute inset-x-8 top-28 h-px bg-slate-200" />
      <div className="absolute inset-x-8 top-44 h-px bg-slate-200" />
      <div className="absolute inset-x-8 top-60 h-px bg-slate-200" />
      <div className="absolute left-8 right-8 top-28 h-8 animate-[wkuScan_1.4s_ease-in-out_infinite] rounded-full bg-teal-300/70 blur-xl" />
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} preserveAspectRatio="none">
        <path d={previewPath} fill="none" stroke="#0f766e" strokeOpacity="0.18" strokeWidth="12" strokeLinecap="round" />
        <path className="wku-preview-line" d={previewPath} fill="none" stroke="#0d9488" strokeWidth="5.2" strokeLinecap="round" />
      </svg>
      <LoadingAgentProgress agentStatuses={agentStatuses} />
    </div>
  </div>
);

const ChartEmpty: React.FC<{ modeLabel?: string }> = ({ modeLabel = 'Who Know U' }) => {
  const previewStages = getStagePreview(modeLabel);

  return (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-black text-white">预览</span>
          <h2 className="text-base font-black text-slate-950">WKU soul-kline 预览盘</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-700">
          先看读盘方式，再生成你的真实连接曲线。曲线展示连接分，柱体表示话题流动性，鼠标停在哪个点，读盘卡片就浮到那里。
        </p>
      </div>
      <div className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">等待样本生成</div>
    </div>

    <div className="relative h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <svg className="block h-full w-full" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} role="img" aria-label="WKU soul-kline 预览连接图" preserveAspectRatio="none">
          <defs>
            <linearGradient id="previewLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="55%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
            <linearGradient id="previewAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="previewVolumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3e635" stopOpacity="0.62" />
              <stop offset="42%" stopColor="#14b8a6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          {[20, 40, 60, 80, 100].map((tick) => {
            const y = scoreToY(tick);
            return <line key={tick} x1={PAD_X} y1={y} x2={VIEWBOX_WIDTH - PAD_X} y2={y} stroke="#cbd5e1" strokeDasharray="5 9" />;
          })}
          <path d={previewAreaPath} fill="url(#previewAreaGradient)" />
          <path d={previewPath} fill="none" stroke="#0f766e" strokeOpacity="0.1" strokeWidth="11" strokeLinecap="round" />
          <path className="wku-preview-line" d={previewPath} fill="none" stroke="url(#previewLineGradient)" strokeWidth="4.6" strokeLinecap="round" />
          <path d={previewPath} fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="1.1" strokeLinecap="round" />
          {previewStages.map((stage, index) => {
            const x = PAD_X + ((VIEWBOX_WIDTH - PAD_X * 2) / 5) * index;
            return (
              <g key={stage.label}>
                <line x1={x} y1={CHART_TOP} x2={x} y2={VOLUME_TOP + VOLUME_HEIGHT} stroke="#cbd5e1" strokeOpacity="0.55" />
                <text x={x} y={424} textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900">{stage.label}</text>
                <text x={x} y={444} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">{stage.detail}</text>
                <rect x={x - 9} y={370 - (index % 3) * 12} width="18" height={28 + (index % 3) * 12} rx="5" fill="url(#previewVolumeGradient)" />
              </g>
            );
          })}
        </svg>
    </div>
  </div>
);
};

const VibeLineChart: React.FC<VibeLineChartProps> = ({ data, loading = false, modeLabel = 'Who Know U', loadingText, agentStatuses }) => {
  const chartData = loading ? [] : data;
  const [activeIndex, setActiveIndex] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ left: '50%', top: '30%' });
  const [tooltipPlacement, setTooltipPlacement] = useState<TooltipPlacement>('right');
  const [tooltipLocked, setTooltipLocked] = useState(false);
  const [hoveredStageName, setHoveredStageName] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setTooltipVisible(false);
    setTooltipLocked(false);
    setHoveredStageName(null);
  }, [chartData.length, modeLabel]);

  const plotData = useMemo<PlotPoint[]>(() => {
    if (chartData.length === 0) return [];
    const step = chartData.length > 1 ? (VIEWBOX_WIDTH - PAD_X * 2) / (chartData.length - 1) : 0;
    const maxVolume = Math.max(...chartData.map((item) => item.volume), 1);

    return chartData.map((item, index) => ({
      ...item,
      stageName: item.stage || item.label,
      x: PAD_X + step * index,
      y: scoreToY(item.close),
      highY: scoreToY(item.high),
      lowY: scoreToY(item.low),
      volumeHeight: Math.max(7, (item.volume / maxVolume) * VOLUME_HEIGHT),
      delta: Math.round((item.close - item.open) * 10) / 10,
    }));
  }, [chartData]);

  const activePoint = plotData[Math.min(activeIndex, Math.max(0, plotData.length - 1))] || plotData[0];
  const activeStageName = hoveredStageName || activePoint?.stageName || '';

  const paths = useMemo(() => {
    const closePath = buildSmoothPath(plotData.map((point) => ({ x: point.x, y: point.y })));
    const highPath = buildSmoothPath(plotData.map((point) => ({ x: point.x, y: point.highY })));
    const lowPath = buildSmoothPath(plotData.map((point) => ({ x: point.x, y: point.lowY })));
    const areaPath = plotData.length
      ? `${closePath} L ${plotData[plotData.length - 1].x} ${CHART_BOTTOM} L ${plotData[0].x} ${CHART_BOTTOM} Z`
      : '';
    return { closePath, highPath, lowPath, areaPath };
  }, [plotData]);

  const stageGroups = useMemo<StageGroup[]>(() => {
    const groups: StageGroup[] = [];
    plotData.forEach((point, index) => {
      const last = groups[groups.length - 1];
      if (!last || last.name !== point.stageName) {
        groups.push({
          name: point.stageName,
          startX: point.x,
          endX: point.x,
          centerX: point.x,
          count: 1,
          startIndex: index,
        });
      } else {
        last.endX = point.x;
        last.centerX = (last.startX + last.endX) / 2;
        last.count += 1;
      }
    });
    return groups;
  }, [plotData]);

  const stageAnchorIndices = useMemo(() => {
    return new Set(stageGroups.map((group) => group.startIndex + Math.floor(group.count / 2)));
  }, [stageGroups]);

  const stats = useMemo(() => {
    if (plotData.length === 0) {
      return { finish: 0, trend: 0, peak: 0, peakLabel: '-' };
    }

    const start = plotData[0].close;
    const finish = plotData[plotData.length - 1].close;
    const peakPoint = plotData.reduce((best, item) => (item.high > best.high ? item : best), plotData[0]);

    return {
      finish,
      trend: Math.round((finish - start) * 10) / 10,
      peak: peakPoint.high,
      peakLabel: `${peakPoint.stageName}/${peakPoint.label}`,
    };
  }, [plotData]);

  const setTooltipFromPoint = (point: PlotPoint) => {
    const anchorX = (point.x / VIEWBOX_WIDTH) * 100;
    const anchorY = (point.y / VIEWBOX_HEIGHT) * 100;
    const rect = svgRef.current?.getBoundingClientRect();
    let side: TooltipPlacement = anchorX > 62 ? 'left' : 'right';
    let left = anchorX;
    let top = clamp(anchorY, 26, 66);

    if (rect) {
      const tooltipWidth = Math.min(360, Math.max(280, rect.width - 28));
      const tooltipHeight = Math.min(320, Math.max(260, rect.height * 0.58));
      const gutter = 18;
      const tooltipWidthPct = (tooltipWidth / rect.width) * 100;
      const tooltipHeightPct = (tooltipHeight / rect.height) * 100;
      const gutterXPct = (gutter / rect.width) * 100;
      const gutterYPct = (gutter / rect.height) * 100;
      const halfWidthPct = tooltipWidthPct / 2 + gutterXPct;
      const halfHeightPct = tooltipHeightPct / 2 + gutterYPct;

      side = chooseTooltipPlacement(point, rect, tooltipWidth, tooltipHeight);

      if (side === 'right') {
        left = clamp(anchorX, gutterXPct, 100 - tooltipWidthPct - gutterXPct);
        top = clamp(anchorY, halfHeightPct, 100 - halfHeightPct);
      }

      if (side === 'left') {
        left = clamp(anchorX, tooltipWidthPct + gutterXPct, 100 - gutterXPct);
        top = clamp(anchorY, halfHeightPct, 100 - halfHeightPct);
      }

      if (side === 'top') {
        left = clamp(anchorX, halfWidthPct, 100 - halfWidthPct);
        top = clamp(anchorY, tooltipHeightPct + gutterYPct, 100 - gutterYPct);
      }

      if (side === 'bottom') {
        left = clamp(anchorX, halfWidthPct, 100 - halfWidthPct);
        top = clamp(anchorY, gutterYPct, 100 - tooltipHeightPct - gutterYPct);
      }
    }

    setTooltipPlacement(side);
    setTooltipPosition({ left: `${left}%`, top: `${top}%` });
    setTooltipVisible(true);
  };

  const getPointerPoint = (clientX: number, clientY: number): PointerPoint | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
      y: ((clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
    };
  };

  const getNearestIndexFromPointer = (pointer: PointerPoint) => {
    if (plotData.length === 0) return 0;
    const step = plotData.length > 1 ? (VIEWBOX_WIDTH - PAD_X * 2) / (plotData.length - 1) : VIEWBOX_WIDTH;
    const stageBandWidth = Math.max(28, step * 0.54);
    const candidateIndices = plotData
      .map((point, index) => ({ index, xDelta: Math.abs(point.x - pointer.x) }))
      .filter(({ xDelta }) => xDelta <= stageBandWidth)
      .map(({ index }) => index);
    const indices = candidateIndices.length ? candidateIndices : plotData.map((_, index) => index);

    return indices.reduce((bestIndex, index) => {
      const point = plotData[index];
      const best = plotData[bestIndex];
      const pointScore = Math.abs(point.x - pointer.x) + Math.abs(point.y - pointer.y) * 0.24;
      const bestScore = Math.abs(best.x - pointer.x) + Math.abs(best.y - pointer.y) * 0.24;
      return pointScore < bestScore ? index : bestIndex;
    }, indices[0]);
  };

  const selectNearestPoint = (clientX: number, clientY: number) => {
    if (tooltipLocked || plotData.length === 0) return;
    const pointer = getPointerPoint(clientX, clientY);
    if (!pointer) return;
    const nearestIndex = getNearestIndexFromPointer(pointer);
    setHoveredStageName(plotData[nearestIndex].stageName);
    setActiveIndex(nearestIndex);
    setTooltipFromPoint(plotData[nearestIndex]);
  };

  const focusStageGroup = (group: StageGroup) => {
    if (tooltipLocked || plotData.length === 0) return;
    const targetIndex = Math.min(plotData.length - 1, group.startIndex + Math.floor(group.count / 2));
    const targetPoint = plotData[targetIndex];
    if (!targetPoint) return;

    setHoveredStageName(group.name);
    setActiveIndex(targetIndex);
    setTooltipFromPoint(targetPoint);
  };

  const unlockTooltip = () => {
    setTooltipLocked(false);
    setTooltipVisible(false);
    setHoveredStageName(null);
  };

  const lockTooltipAtIndex = (index: number) => {
    const point = plotData[index];
    if (!point) return;

    setHoveredStageName(point.stageName);
    setActiveIndex(index);
    setTooltipFromPoint(point);
    setTooltipLocked(true);
  };

  useGSAP(() => {
    if (plotData.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.soul-kline-draw', { strokeDashoffset: 0 });
      gsap.set('.soul-kline-area', { autoAlpha: 1 });
    });
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('.soul-kline-draw', { strokeDasharray: 1800, strokeDashoffset: 1800 });
      gsap.set('.soul-kline-area', { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.from('.wku-chart-shell', {
        autoAlpha: 0.92,
        y: 12,
        filter: 'blur(8px)',
        duration: 0.34,
        clearProps: 'filter,transform,opacity,visibility',
      })
        .to('.soul-kline-area', {
          autoAlpha: 1,
          duration: 0.42,
        }, 0.08)
        .to('.soul-kline-draw', {
          strokeDashoffset: 0,
          duration: 1.08,
          ease: 'power2.out',
        }, 0.02)
        .from('.wku-volume-bar', {
          scaleY: 0,
          transformOrigin: '50% 100%',
          duration: 0.42,
          stagger: { amount: 0.24, from: 'start' },
          clearProps: 'transform',
        }, 0.16);
    });

    return () => mm.revert();
  }, { scope: chartRef, dependencies: [plotData.length, modeLabel], revertOnUpdate: true });

  useGSAP(() => {
    if (plotData.length === 0) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.fromTo(
      '.wku-point-tooltip',
      { autoAlpha: 0.94, y: 8, filter: 'blur(4px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.22,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'filter,transform,opacity,visibility',
      }
    );
    gsap.fromTo(
      '.wku-active-node circle',
      { scale: 0.86, transformOrigin: '50% 50%' },
      {
        scale: 1,
        duration: 0.2,
        ease: 'power3.out',
        overwrite: 'auto',
        clearProps: 'transform',
      }
    );
  }, { scope: chartRef, dependencies: [activeIndex], revertOnUpdate: false });

  if (loading) return <ChartLoading modeLabel={modeLabel} loadingText={loadingText} agentStatuses={agentStatuses} />;
  if (chartData.length === 0) return <ChartEmpty modeLabel={modeLabel} />;

  return (
    <div ref={chartRef} className="wku-chart-card relative overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(248,250,252,0)_38%)]" />

      <div className="relative mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="wku-chip wku-chip-dark">{modeLabel}</span>
            <h2 className="text-lg font-black text-slate-950">WKU soul-kline</h2>
            <span className="wku-chip wku-chip-signal">{plotData.length} 节点</span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-700">
            六阶段连接生命周期，每阶段拆成 3 个微节点。沿曲线移动或聚焦节点，读盘卡片会解释当前点位。
          </p>
          <div className="wku-score-guide wku-chart-score-guide" aria-label="分数怎么读">
            <div className="wku-score-guide-head">
              <p className="text-xs font-black text-teal-700">分数怎么读</p>
              <span>70+：更容易继续靠近 · 50-69：需要更具体话题 · 低于 50：先降低推进感</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="wku-stat-tile px-3 py-2">
            <p className="font-bold text-slate-600">连接分</p>
            <p className="mt-1 text-lg font-black text-slate-950">{stats.finish}</p>
          </div>
          <div className="wku-stat-tile px-3 py-2">
            <p className="font-bold text-slate-600">变化</p>
            <p className={`mt-1 text-lg font-black ${stats.trend >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
              {stats.trend >= 0 ? '+' : ''}{stats.trend}
            </p>
          </div>
          <div className="wku-stat-tile px-3 py-2">
            <p className="font-bold text-slate-600">最易被懂</p>
            <p className="mt-1 text-lg font-black text-sky-700">{stats.peak}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className="wku-chart-shell relative overflow-hidden"
          onMouseLeave={() => {
            if (!tooltipLocked) {
              setTooltipVisible(false);
              setHoveredStageName(null);
            }
          }}
        >
          <svg
            ref={svgRef}
            className="block h-[540px] w-full"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            role="img"
            aria-label="WKU soul-kline 十八节点连接曲线"
            preserveAspectRatio="none"
          >
            <defs>
              <style>
                {`
                  @keyframes soulLineDrawSvg {
                    to { stroke-dashoffset: 0; }
                  }
                  @keyframes soulAreaFadeSvg {
                    to { opacity: 1; }
                  }
                .soul-kline-draw {
                  stroke-dasharray: 1800;
                  stroke-dashoffset: 1800;
                }
                .soul-kline-area {
                  opacity: 0;
                }
                  @media (prefers-reduced-motion: reduce) {
                    .soul-kline-draw {
                      stroke-dashoffset: 0;
                      animation: none;
                    }
                    .soul-kline-area {
                      opacity: 1;
                      animation: none;
                    }
                  }
                `}
              </style>
              <linearGradient id="soulLineGradientSvg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="48%" stopColor="#14b8a6" />
                <stop offset="76%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
              <linearGradient id="soulHighGradientSvg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.42" />
                <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.48" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0.36" />
              </linearGradient>
              <linearGradient id="soulLowGradientSvg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
                <stop offset="46%" stopColor="#14b8a6" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0.22" />
              </linearGradient>
              <linearGradient id="soulAreaGradientSvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                <stop offset="58%" stopColor="#0ea5e9" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="volumeGradientSvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.74" />
                <stop offset="42%" stopColor="#14b8a6" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="stagePillGradientSvg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ecfeff" stopOpacity="0.86" />
                <stop offset="55%" stopColor="#f8fafc" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f7fee7" stopOpacity="0.76" />
              </linearGradient>
              <filter id="soulGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.35" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[20, 40, 60, 80, 100].map((tick) => {
              const y = scoreToY(tick);
              return (
                <g key={tick}>
                  <line x1={PAD_X} y1={y} x2={VIEWBOX_WIDTH - PAD_X} y2={y} stroke="#cbd5e1" strokeDasharray="5 9" strokeOpacity="0.8" />
                  <text x={24} y={y + 4} fill="#475569" fontSize="12" fontWeight="800">
                    {tick}
                  </text>
                </g>
              );
            })}

            {stageGroups.map((group, index) => {
              const active = activeStageName === group.name;
              return (
              <g key={group.name}>
                {active && (
                  <rect
                    x={Math.max(PAD_X, group.startX - 22)}
                    y={CHART_TOP - 8}
                    width={Math.max(44, group.endX - group.startX + 44)}
                    height={VOLUME_TOP + VOLUME_HEIGHT - CHART_TOP + 16}
                    rx="12"
                    fill="#22d3ee"
                    opacity="0.08"
                  />
                )}
                {index > 0 && <line x1={group.startX - 18} y1={CHART_TOP} x2={group.startX - 18} y2={VOLUME_TOP + VOLUME_HEIGHT} stroke="#cbd5e1" strokeOpacity="0.9" />}
                <rect
                  x={group.centerX - 58}
                  y={402}
                  width="116"
                  height="50"
                  rx="16"
                  fill="url(#stagePillGradientSvg)"
                  opacity={active ? 0.96 : 0.68}
                  stroke={active ? '#67e8f9' : '#dbeafe'}
                  strokeOpacity={active ? 0.72 : 0.32}
                />
                <text x={group.centerX} y={424} textAnchor="middle" fill={active ? '#020617' : '#0f172a'} fontSize="14" fontWeight="900">
                  {group.name}
                </text>
                <text x={group.centerX} y={444} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="800">
                  {stageHint(group.name, modeLabel)}
                </text>
              </g>
            );})}

            {plotData.map((point) => (
              <rect
              key={`volume-${point.id}`}
              className="wku-volume-bar"
                x={point.x - 8}
                y={VOLUME_TOP + VOLUME_HEIGHT - point.volumeHeight}
                width="16"
                height={point.volumeHeight}
                rx="5"
                fill="url(#volumeGradientSvg)"
              />
            ))}

            <path className="soul-kline-area" d={paths.areaPath} fill="url(#soulAreaGradientSvg)" />
            <path d={paths.highPath} fill="none" stroke="url(#soulHighGradientSvg)" strokeWidth="2.4" strokeDasharray="7 8" />
            <path d={paths.lowPath} fill="none" stroke="url(#soulLowGradientSvg)" strokeWidth="2.4" strokeDasharray="7 8" />
            <path d={paths.closePath} fill="none" stroke="#0f766e" strokeOpacity="0.1" strokeWidth="11" strokeLinecap="round" />
            <path className="soul-kline-draw" d={paths.closePath} fill="none" stroke="url(#soulLineGradientSvg)" strokeWidth="4.6" strokeLinecap="round" filter="url(#soulGlow)" />
            <path d={paths.closePath} fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.1" strokeLinecap="round" />

            <rect
              x={PAD_X}
              y={CHART_TOP}
              width={VIEWBOX_WIDTH - PAD_X * 2}
              height={VOLUME_TOP + VOLUME_HEIGHT - CHART_TOP}
              fill="transparent"
              onMouseMove={(event) => selectNearestPoint(event.clientX, event.clientY)}
              onClick={() => {
                if (tooltipLocked) unlockTooltip();
              }}
              onTouchMove={(event) => {
                const touch = event.touches[0];
                if (touch) selectNearestPoint(touch.clientX, touch.clientY);
              }}
              onTouchEnd={() => {
                if (!tooltipLocked) {
                  setTooltipVisible(false);
                  setHoveredStageName(null);
                }
              }}
            />

            {stageGroups.map((group) => (
              <rect
                key={`stage-hover-${group.name}`}
                className="wku-stage-hover-zone"
                x={Math.max(PAD_X, group.startX - 24)}
                y={CHART_TOP}
                width={Math.min(VIEWBOX_WIDTH - PAD_X, group.endX + 24) - Math.max(PAD_X, group.startX - 24)}
                height={VOLUME_TOP + VOLUME_HEIGHT - CHART_TOP}
                rx="14"
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`查看${group.name}阶段的三个节点`}
                onMouseEnter={() => focusStageGroup(group)}
                onMouseMove={() => focusStageGroup(group)}
                onFocus={() => focusStageGroup(group)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    focusStageGroup(group);
                  }
                }}
                onMouseLeave={() => {
                  if (!tooltipLocked) setHoveredStageName(null);
                }}
                onClick={() => {
                  if (tooltipLocked) unlockTooltip();
                }}
              />
            ))}

            {plotData.map((point, index) => {
              const isActive = activePoint?.id === point.id;
              const isStageActive = activeStageName === point.stageName;
              const isMajor = stageAnchorIndices.has(index);
              return (
                <g
                key={point.id}
                  onMouseEnter={() => {
                    if (tooltipLocked) return;
                    setHoveredStageName(point.stageName);
                    setActiveIndex(index);
                    setTooltipFromPoint(point);
                  }}
                  onFocus={() => {
                    if (tooltipLocked) return;
                    setHoveredStageName(point.stageName);
                    setActiveIndex(index);
                    setTooltipFromPoint(point);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    lockTooltipAtIndex(index);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      lockTooltipAtIndex(index);
                    }
                  }}
                  onBlur={() => {
                    if (!tooltipLocked) setTooltipVisible(false);
                  }}
                  tabIndex={0}
                className={`cursor-pointer outline-none ${isActive ? 'wku-active-node' : ''} ${isStageActive ? 'wku-stage-node' : ''}`}
                >
                  <line x1={point.x} y1={CHART_TOP} x2={point.x} y2={VOLUME_TOP + VOLUME_HEIGHT} stroke="#94a3b8" strokeOpacity={isActive ? 0.42 : isStageActive ? 0.3 : 0.14} />
                  {isMajor && (
                    <>
                      <circle cx={point.x} cy={point.y} r={isActive ? 22 : isStageActive ? 20 : 18} fill="#020617" opacity={isActive ? 0.12 : isStageActive ? 0.1 : 0.08} />
                      <circle cx={point.x} cy={point.y} r={isActive ? 15 : isStageActive ? 13.5 : 12} fill="#020617" stroke={isStageActive ? '#a3e635' : '#67e8f9'} strokeWidth={isActive ? 3 : 2.5} />
                      <circle cx={point.x} cy={point.y} r={isActive ? 5 : isStageActive ? 4.8 : 4} fill="#d9f99d" />
                      <rect x={point.x - 22} y={Math.max(14, point.y - 43)} width="44" height="20" rx="6" fill="#020617" opacity={isActive || isStageActive ? 1 : 0.9} />
                      <text x={point.x} y={Math.max(28, point.y - 29)} textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="900">
                        {point.stageName}
                      </text>
                    </>
                  )}
                  {!isMajor && (
                    <>
                      <circle cx={point.x} cy={point.y} r={isActive ? 8 : isStageActive ? 6 : 4.2} fill="#ffffff" stroke={isActive || isStageActive ? '#0891b2' : '#0f172a'} strokeWidth={isActive ? 3 : isStageActive ? 2.4 : 2} />
                      <circle cx={point.x} cy={point.y} r={isActive ? 18 : isStageActive ? 14 : 9} fill="none" stroke="#14b8a6" strokeOpacity={isActive ? 0.36 : isStageActive ? 0.28 : 0.1} strokeWidth="2" />
                    </>
                  )}
                  {isActive && !isMajor && (
                    <text x={point.x} y={Math.max(18, point.y - 16)} textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900">
                      {point.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {activePoint && tooltipVisible && (
            <div
              className="wku-point-tooltip"
              data-side={tooltipPlacement}
              data-locked={tooltipLocked ? 'true' : 'false'}
              style={tooltipPosition}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500">
                    当前点位
                    {tooltipLocked && <span className="wku-lock-chip">已锁定</span>}
                  </p>
                  <h3 className="mt-1 text-base font-black text-slate-950">{activePoint.stageName} / {activePoint.label}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{activePoint.style}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DeltaBadge value={activePoint.delta} />
                  {tooltipLocked && (
                    <button type="button" className="wku-tooltip-close" onClick={unlockTooltip}>
                      解除锁定
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-slate-700">进入分 <b className="text-slate-950">{activePoint.open}</b></span>
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-slate-700">留存分 <b className="text-slate-950">{activePoint.close}</b></span>
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-slate-700">最懂上限 <b className="text-slate-950">{activePoint.high}</b></span>
                <span className="rounded-lg bg-white/80 px-2.5 py-2 text-slate-700">误会下限 <b className="text-slate-950">{activePoint.low}</b></span>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-700">{activePoint.reason}</p>

              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>话题流动</span>
                  <span>{activePoint.volume}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, activePoint.volume)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>理解成本</span>
                  <span>{activePoint.volatility}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, activePoint.volatility)}%` }} />
                </div>
              </div>
              <p className="mt-3 text-[11px] font-bold text-slate-500">
                {tooltipLocked ? '点击空白处或按钮解除锁定；只有点到节点时才会切换读盘。' : '移动查看节点，点击节点可锁定读盘卡片。'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1 font-bold text-sky-700">主线：留存连接分</span>
          <span className="rounded-md border border-teal-200 bg-teal-50 px-2 py-1 font-bold text-teal-700">柱体：话题流动性</span>
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 font-bold text-rose-700">虚线：被懂上限与误会下限</span>
        </div>
        <span className="font-bold text-slate-600">最容易被懂：{stats.peakLabel}</span>
      </div>
    </div>
  );
};

export default VibeLineChart;
