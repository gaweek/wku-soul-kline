import React from 'react';
import { Shield, BookOpen } from 'lucide-react';

interface CopyrightNoticeProps {
  variant?: 'full' | 'compact';
  className?: string;
}

const CopyrightNotice: React.FC<CopyrightNoticeProps> = ({
  variant = 'full',
  className = ''
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-xs text-amber-600 ${className}`}>
        <Shield className="w-3.5 h-3.5" />
        <span>自研中华古法命理科学算法 · 非通用大模型内容</span>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-amber-800 mb-1.5 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            算法声明
          </h4>
          <p className="text-sm text-amber-700 leading-relaxed">
            本分析由<span className="font-semibold">「人生K线」自研中华古法命理科学算法</span>生成，
            基于《滴天髓》《穷通宝鉴》《子平真诠》《三命通会》等经典命理典籍的数字化呈现，
            <span className="font-semibold">非通用大模型泛泛之词</span>。
            算法核心为传统八字命理学的逻辑推理与精准分析。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CopyrightNotice;
