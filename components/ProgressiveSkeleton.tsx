/**
 * 渐进式骨架屏组件
 * 在Agent返回结果前显示优雅的加载状态
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressiveSkeletonProps {
  type: 'card' | 'summary' | 'chart' | 'kline';
  title?: string;
  lines?: number;
  height?: number;
}

const ProgressiveSkeleton: React.FC<ProgressiveSkeletonProps> = ({
  type,
  title,
  lines = 4,
  height = 200,
}) => {
  // 卡片类型骨架
  if (type === 'card') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full animate-pulse">
        {/* 标题行 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded" />
        </div>

        {/* 内容行 */}
        <div className="space-y-3 flex-grow">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-gray-200 rounded"
              style={{ width: `${85 - i * 10}%` }}
            />
          ))}
        </div>

        {/* 评分条 */}
        <div className="pt-4 mt-4 border-t border-gray-50">
          <div className="h-2 bg-gray-100 rounded mb-2 w-16" />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-200 w-1/2 animate-pulse" />
            </div>
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>

        {/* 加载指示器 */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{title ? `分析${title}中...` : '分析中...'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 总评类型骨架
  if (type === 'summary') {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-200 rounded" />
            <div className="h-6 w-24 bg-indigo-200 rounded" />
          </div>
          <div className="w-full md:w-1/3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-indigo-100 rounded-full" />
              <div className="h-4 w-12 bg-indigo-200 rounded" />
            </div>
          </div>
        </div>

        {/* 内容行 */}
        <div className="space-y-3">
          <div className="h-4 bg-indigo-100 rounded w-full" />
          <div className="h-4 bg-indigo-100 rounded w-11/12" />
          <div className="h-4 bg-indigo-100 rounded w-10/12" />
          <div className="h-4 bg-indigo-100 rounded w-9/12" />
        </div>

        {/* 中心加载指示 */}
        <div className="flex items-center justify-center mt-4 text-indigo-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">正在深度分析命理...</span>
        </div>
      </div>
    );
  }

  // K线图骨架
  if (type === 'kline' || type === 'chart') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
        </div>

        {/* K线图占位 */}
        <div
          className="bg-gray-100 rounded-lg flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="flex flex-col items-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">正在生成100年K线数据...</span>
            <span className="text-xs mt-1 text-gray-300">这可能需要10-15秒</span>
          </div>
        </div>

        {/* 底部时间轴占位 */}
        <div className="mt-4 flex justify-between">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-3 w-8 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // 默认骨架
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${90 - i * 5}%` }} />
        ))}
      </div>
    </div>
  );
};

// 多卡片网格骨架
export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProgressiveSkeleton key={i} type="card" lines={4} />
      ))}
    </div>
  );
};

// 完整页面骨架
export const FullPageSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Agent状态栏 */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex flex-wrap gap-2 justify-center">
          {['核心命理', 'K线数据', '事业财富', '婚姻健康', '币圈分析'].map((name, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 animate-pulse">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs font-medium text-blue-500">{name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center text-xs text-gray-500 animate-pulse">
          正在启动5个专业Agent并行分析...
        </div>
      </div>

      {/* 八字展示 */}
      <div className="flex justify-center gap-2 md:gap-8 bg-gray-900 p-6 rounded-xl animate-pulse">
        {['年柱', '月柱', '日柱', '时柱'].map((label, i) => (
          <div key={i} className="text-center min-w-[60px]">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="h-8 w-12 bg-gray-700 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* 总评 */}
      <ProgressiveSkeleton type="summary" />

      {/* 卡片网格 */}
      <SkeletonGrid count={9} />
    </div>
  );
};

export default ProgressiveSkeleton;
