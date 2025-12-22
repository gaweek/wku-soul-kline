import React from 'react';
import { Sparkles } from 'lucide-react';

interface CTACardProps {
  onGenerate: () => void;
}

export const CTACard: React.FC<CTACardProps> = ({ onGenerate }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-bold text-gray-800">开始你的命理分析</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        输入生辰信息，即刻获取专业的命理测算报告，了解你的人生轨迹与发展潜力。
      </p>

      <button
        onClick={onGenerate}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        立即测算
      </button>
    </div>
  );
};
